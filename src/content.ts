import { start } from "./main";

start({
  async get(key) {
    const name = `wait:${key}`;
    const value = (await chrome.storage.local.get(name))[name];
    return typeof value === "number" ? value : undefined;
  },
  async set(key, value) {
    await chrome.storage.local.set({ [`wait:${key}`]: value });
  },
});
