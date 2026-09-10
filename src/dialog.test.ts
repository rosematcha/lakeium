import { beforeEach, describe, expect, it } from "vitest";
import { isHelpOpen, showHelp } from "./dialog";

function shadow(): ShadowRoot {
  const root = document.getElementById("lakeium-help")?.shadowRoot;
  if (!root) throw new Error("dialog not mounted");
  return root;
}

describe("showHelp", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="svelte"><div data-root class="light" style="--lc-primary: #a41c32"></div></div>';
  });

  it("mounts outside the app container", () => {
    showHelp();
    expect(document.querySelector("body > #lakeium-help")).not.toBeNull();
    expect(document.querySelector("#svelte #lakeium-help")).toBeNull();
  });

  it("survives the app re-rendering its container", () => {
    showHelp();
    const app = document.getElementById("svelte");
    if (app) app.innerHTML = '<div data-root class="dark"></div>';
    expect(isHelpOpen()).toBe(true);
  });

  it("mirrors the site theme variables", () => {
    showHelp();
    const host = document.getElementById("lakeium-help");
    expect(host?.style.getPropertyValue("--lc-primary")).toBe("#a41c32");
  });

  it("renders the four actions", () => {
    showHelp();
    const hrefs = [...shadow().querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["tel:988", "sms:988", "https://988lifeline.org/chat/", "https://988lifeline.org/"]);
  });

  it("does not stack duplicates", () => {
    showHelp();
    showHelp();
    expect(document.querySelectorAll("#lakeium-help")).toHaveLength(1);
  });

  it("dismisses with the close button", () => {
    showHelp();
    shadow().querySelector<HTMLButtonElement>(".close")?.click();
    expect(isHelpOpen()).toBe(false);
  });

  it("dismisses with Escape", () => {
    showHelp();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(isHelpOpen()).toBe(false);
  });

  it("dismisses on backdrop click but not dialog click", () => {
    showHelp();
    shadow().querySelector<HTMLElement>(".dialog")?.click();
    expect(isHelpOpen()).toBe(true);
    shadow().querySelector<HTMLElement>(".overlay")?.click();
    expect(isHelpOpen()).toBe(false);
  });
});
