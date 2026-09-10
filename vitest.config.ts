import { defineConfig } from "vitest/config";

export default defineConfig({
  define: { __BUILD_ID__: "1" },
  test: {
    environment: "happy-dom",
    // The video embed must not hit the network during tests.
    environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
  },
});
