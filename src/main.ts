import { showHelp } from "./dialog";
import { createSearchTrigger } from "./search";
import { isDue } from "./timing";
import { showTrolleyVideo } from "./video";

/**
 * visit and trolley hold when each trigger last fired, so they wait independently.
 * trolleyPending holds when an unfinished video started (0 once watched), so reloading can't skip it.
 */
export type StoreKey = "visit" | "trolley" | "trolleyPending";

/** Persists timestamps per key; backed by chrome.storage or GM storage. */
export interface KeyStore {
  get(key: StoreKey): Promise<number | undefined>;
  set(key: StoreKey, value: number): Promise<void>;
}

async function offerIfDue(store: KeyStore, key: "visit" | "trolley", show: () => boolean): Promise<void> {
  const now = Date.now();
  if (!isDue(await store.get(key), now)) return;
  // Only start the wait if it actually appeared (it may already be showing).
  if (show()) await store.set(key, now);
}

function playTrolley(store: KeyStore): boolean {
  const shown = showTrolleyVideo(() => void store.set("trolleyPending", 0));
  if (shown) void store.set("trolleyPending", Date.now());
  return shown;
}

async function resumePendingVideo(store: KeyStore): Promise<void> {
  if (await store.get("trolleyPending")) playTrolley(store);
}

function watchSearch(onMatch: () => void): MutationObserver {
  const check = createSearchTrigger(document);
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (check()) onMatch();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt"] });
  return observer;
}

/** Starts both triggers; returns a function that stops watching searches. */
export function start(store: KeyStore): () => void {
  void offerIfDue(store, "visit", () => showHelp());
  void resumePendingVideo(store);
  const observer = watchSearch(() => void offerIfDue(store, "trolley", () => playTrolley(store)));
  return () => {
    observer.disconnect();
  };
}
