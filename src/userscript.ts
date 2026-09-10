import { start } from "./main";

declare function GM_getValue(key: string, fallback?: unknown): unknown;
declare function GM_setValue(key: string, value: unknown): void;

const KEY = "lastShown";

start({
  get() {
    const value = GM_getValue(KEY);
    return Promise.resolve(typeof value === "number" ? value : undefined);
  },
  set(value) {
    GM_setValue(KEY, value);
    return Promise.resolve();
  },
});
