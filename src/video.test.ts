import { beforeEach, describe, expect, it, vi } from "vitest";
import { isVideoActive, showTrolleyVideo } from "./video";

function post(payload: object, origin = "https://www.youtube-nocookie.com"): void {
  window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(payload), origin }));
}

function playThrough(): void {
  for (let t = 0; t <= 30; t += 0.5) {
    post({ event: "infoDelivery", info: { currentTime: t, duration: 30, playerState: 1 } });
  }
  post({ event: "onStateChange", info: 0 });
}

describe("showTrolleyVideo", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="svelte"><div data-root><div class="search-results"></div></div></div>';
  });

  it("mounts outside the app container with a controls-free embed", () => {
    expect(showTrolleyVideo(() => undefined)).toBe(true);
    const host = document.querySelector("body > #lakeium-trolley");
    const src = host?.shadowRoot?.querySelector("iframe")?.getAttribute("src") ?? "";
    expect(src).toContain("/embed/3U40ngOGJpY");
    expect(src).toContain("controls=0");
    expect(src).toContain("enablejsapi=1");
  });

  it("does not stack", () => {
    showTrolleyVideo(() => undefined);
    expect(showTrolleyVideo(() => undefined)).toBe(false);
    expect(document.querySelectorAll("#lakeium-trolley")).toHaveLength(1);
  });

  it("stays until watched through, then removes itself", () => {
    const onDone = vi.fn();
    showTrolleyVideo(onDone);
    post({ event: "infoDelivery", info: { currentTime: 10, duration: 30, playerState: 1 } });
    expect(isVideoActive()).toBe(true);
    playThrough();
    expect(onDone).toHaveBeenCalledOnce();
    expect(isVideoActive()).toBe(false);
  });

  it("ignores messages from other origins", () => {
    const onDone = vi.fn();
    showTrolleyVideo(onDone);
    for (let t = 0; t <= 30; t += 0.5) {
      post({ event: "infoDelivery", info: { currentTime: t, duration: 30, playerState: 1 } }, "https://evil.example");
    }
    post({ event: "onStateChange", info: 0 }, "https://evil.example");
    expect(onDone).not.toHaveBeenCalled();
    expect(isVideoActive()).toBe(true);
  });
});
