import { showHelp } from "./dialog";
import { createSearchTrigger } from "./search";
import { isDue } from "./timing";
import { showTrolleyVideo } from "./video";

/** When each trigger last completed, so they wait independently. */
export type StoreKey = "visit" | "trolley";

/** Persists timestamps per key; backed by chrome.storage or GM storage. */
export interface KeyStore {
  get(key: StoreKey): Promise<number | undefined>;
  set(key: StoreKey, value: number): Promise<void>;
}

async function offerVisit(store: KeyStore): Promise<void> {
  const now = Date.now();
  if (!isDue(await store.get("visit"), now)) return;
  // Only start the wait if the dialog actually appeared (it may already be open).
  if (showHelp()) await store.set("visit", now);
}

/** The Trolley wait starts once the video has been watched through, not when it appears. */
async function offerTrolley(store: KeyStore): Promise<void> {
  if (!isDue(await store.get("trolley"), Date.now())) return;
  showTrolleyVideo(() => void store.set("trolley", Date.now()));
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
  void offerVisit(store);
  const observer = watchSearch(() => void offerTrolley(store));
  return () => {
    observer.disconnect();
  };
}
