import { showHelp } from "./dialog";
import { createSearchTrigger } from "./search";
import { isNewVisit } from "./timing";

/** Persists the last time help was offered; backed by chrome.storage or GM storage. */
export interface LastShownStore {
  get(): Promise<number | undefined>;
  set(value: number): Promise<void>;
}

/** Set by `ALWAYS_SHOW=1 npm run build` to skip the visit window while testing. */
declare const __ALWAYS_SHOW__: boolean;

async function offerOnVisit(store: LastShownStore): Promise<void> {
  const now = Date.now();
  if (!__ALWAYS_SHOW__ && !isNewVisit(await store.get(), now)) return;
  await store.set(now);
  showHelp();
}

function watchSearch(): void {
  const check = createSearchTrigger(document);
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (check()) showHelp();
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt"] });
}

export function start(store: LastShownStore): void {
  void offerOnVisit(store);
  watchSearch();
}
