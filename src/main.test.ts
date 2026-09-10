import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isHelpOpen } from "./dialog";
import { start as startWatching, type KeyStore, type StoreKey } from "./main";
import { isVideoActive } from "./video";

// Each test's watcher must stop, or it reacts to later tests' DOM changes.
const stops: (() => void)[] = [];
function start(store: KeyStore): void {
  stops.push(startWatching(store));
}
afterEach(() => {
  stops.splice(0).forEach((stop) => {
    stop();
  });
});

function memoryStore(initial: Partial<Record<StoreKey, number>> = {}): KeyStore & { values: Partial<Record<StoreKey, number>> } {
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

function post(payload: object): void {
  window.dispatchEvent(
    new MessageEvent("message", { data: JSON.stringify(payload), origin: "https://www.youtube-nocookie.com" }),
  );
}

function watchVideoThrough(): void {
  for (let t = 0; t <= 16; t += 0.5) {
    post({ event: "infoDelivery", info: { currentTime: t, duration: 16, playerState: 1 } });
  }
  post({ event: "onStateChange", info: 0 });
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
  });

  it("stays quiet within the visit wait", async () => {
    start(memoryStore({ visit: Date.now() }));
    await settle();
    expect(isHelpOpen()).toBe(false);
    expect(isVideoActive()).toBe(false);
  });

  it("plays the video for Trolley without starting the wait until it is watched", async () => {
    const store = memoryStore({ visit: Date.now() });
    start(store);
    searchTrolley();
    await settle();
    expect(isVideoActive()).toBe(true);
    expect(isHelpOpen()).toBe(false);
    expect(store.values.trolley).toBeUndefined();

    watchVideoThrough();
    await settle();
    expect(isVideoActive()).toBe(false);
    expect(store.values.trolley).toBeTypeOf("number");
  });

  it("stays quiet for Trolley within the Trolley wait", async () => {
    start(memoryStore({ visit: Date.now(), trolley: Date.now() }));
    searchTrolley();
    await settle();
    expect(isVideoActive()).toBe(false);
  });

  it("does not bring the video back on reload until the next search", async () => {
    start(memoryStore({ visit: Date.now() }));
    await settle();
    expect(isVideoActive()).toBe(false);
  });
});
