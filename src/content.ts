import { start } from "./main";

const KEY = "lastShown";

start({
  async get() {
    const value = (await chrome.storage.local.get(KEY))[KEY];
    return typeof value === "number" ? value : undefined;
  },
  async set(value) {
    await chrome.storage.local.set({ [KEY]: value });
  },
});
