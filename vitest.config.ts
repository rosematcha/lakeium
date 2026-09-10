import { defineConfig } from "vitest/config";

export default defineConfig({
  define: { __ALWAYS_SHOW__: "false" },
  test: { environment: "happy-dom" },
});
