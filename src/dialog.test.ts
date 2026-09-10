import { beforeEach, describe, expect, it } from "vitest";
import { isHelpOpen, showHelp } from "./dialog";

function shadow(): ShadowRoot {
  const root = document.getElementById("lakeium-help")?.shadowRoot;
  if (!root) throw new Error("dialog not mounted");
  return root;
}

describe("showHelp", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div data-root class="light"></div>';
  });

  it("mounts inside the site theme root", () => {
    showHelp();
    expect(document.querySelector("[data-root] > #lakeium-help")).not.toBeNull();
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
