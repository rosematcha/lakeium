import { beforeEach, describe, expect, it } from "vitest";
import { isHelpOpen } from "./dialog";
import { start, type WaitKey, type WaitStore } from "./main";

function memoryStore(initial: Partial<Record<WaitKey, number>> = {}): WaitStore & { values: Partial<Record<WaitKey, number>> } {
  const values = { ...initial };
  return {
    values,
    get: (key) => Promise.resolve(values[key]),
    set: (key, value) => {
      values[key] = value;
      return Promise.resolve();
    },
  };
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

function searchTrolley(): void {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div><form><input type="text" value="Precious Trolley"></form>
      <div class="search-results"><img alt="Precious Trolley"></div></div>`,
  );
}

describe("start", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div data-root></div>";
  });

  it("offers help on a new visit and starts the visit wait", async () => {
    const store = memoryStore();
    start(store);
    await settle();
    expect(isHelpOpen()).toBe(true);
    expect(store.values.visit).toBeTypeOf("number");
    expect(store.values.trolley).toBeUndefined();
  });

  it("stays quiet within the visit wait", async () => {
    start(memoryStore({ visit: Date.now() }));
    await settle();
    expect(isHelpOpen()).toBe(false);
  });

  it("offers help for Trolley even inside the visit wait", async () => {
    const store = memoryStore({ visit: Date.now() });
    start(store);
    searchTrolley();
    await settle();
    expect(isHelpOpen()).toBe(true);
    expect(store.values.trolley).toBeTypeOf("number");
  });

  it("stays quiet for Trolley within the Trolley wait", async () => {
    start(memoryStore({ visit: Date.now(), trolley: Date.now() }));
    searchTrolley();
    await settle();
    expect(isHelpOpen()).toBe(false);
  });
});
