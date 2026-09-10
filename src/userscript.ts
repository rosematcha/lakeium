import { start } from "./main";

declare function GM_getValue(key: string, fallback?: unknown): unknown;
declare function GM_setValue(key: string, value: unknown): void;

start({
  get(key) {
    const value = GM_getValue(`wait:${key}`);
    return Promise.resolve(typeof value === "number" ? value : undefined);
  },
  set(key, value) {
    GM_setValue(`wait:${key}`, value);
    return Promise.resolve();
  },
});
