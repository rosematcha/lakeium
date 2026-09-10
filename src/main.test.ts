import { beforeEach, describe, expect, it } from "vitest";
import { isHelpOpen } from "./dialog";
import { start, type LastShownStore } from "./main";

function memoryStore(initial?: number): LastShownStore & { value: number | undefined } {
  const store = {
    value: initial,
    get: () => Promise.resolve(store.value),
    set: (value: number) => {
      store.value = value;
      return Promise.resolve();
    },
  };
  return store;
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe("start", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div data-root></div>";
  });

  it("offers help on a new visit and records the time", async () => {
    const store = memoryStore();
    start(store);
    await tick();
    expect(isHelpOpen()).toBe(true);
    expect(store.value).toBeTypeOf("number");
  });

  it("stays quiet within the visit window", async () => {
    const store = memoryStore(Date.now());
    start(store);
    await tick();
    expect(isHelpOpen()).toBe(false);
  });
});
