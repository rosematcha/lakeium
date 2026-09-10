import { showHelp } from "./dialog";
import { createSearchTrigger } from "./search";
import { isDue } from "./timing";

/** Each trigger has its own wait, so a page visit doesn't suppress the Trolley offer or vice versa. */
export type WaitKey = "visit" | "trolley";

/** Persists when help was last shown per trigger; backed by chrome.storage or GM storage. */
export interface WaitStore {
  get(key: WaitKey): Promise<number | undefined>;
  set(key: WaitKey, value: number): Promise<void>;
}

async function offerIfDue(store: WaitStore, key: WaitKey): Promise<void> {
  const now = Date.now();
  if (!isDue(await store.get(key), now)) return;
  // Only start the wait if the dialog actually appeared (it may already be open).
  if (showHelp()) await store.set(key, now);
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
export function start(store: WaitStore): () => void {
  void offerIfDue(store, "visit");
  const observer = watchSearch(() => void offerIfDue(store, "trolley"));
  return () => {
    observer.disconnect();
  };
}
