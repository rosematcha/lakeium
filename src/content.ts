import { showHelp } from "./dialog";
import { createSearchTrigger } from "./search";
import { isNewVisit } from "./timing";

const STORAGE_KEY = "lastShown";

async function offerOnVisit(): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const lastShown = stored[STORAGE_KEY];
  const now = Date.now();
  if (!isNewVisit(typeof lastShown === "number" ? lastShown : undefined, now)) return;
  await chrome.storage.local.set({ [STORAGE_KEY]: now });
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

void offerOnVisit();
watchSearch();
