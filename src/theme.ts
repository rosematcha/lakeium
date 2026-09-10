const THEME_VARS = [
  "--lc-primary",
  "--lc-text",
  "--lc-text-two",
  "--lc-bg-two",
  "--lc-el",
  "--lc-el-two",
  "--lc-border",
  "--lc-link-blue",
] as const;

function syncTheme(host: HTMLElement, doc: Document): void {
  const root = doc.querySelector("[data-root]");
  if (!root) return;
  const computed = getComputedStyle(root);
  for (const name of THEME_VARS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) host.style.setProperty(name, value);
  }
}

/**
 * Copies the site's --lc-* values onto a host mounted outside the app container,
 * and keeps them current when the site switches themes. Returns a stop function.
 */
export function mirrorTheme(host: HTMLElement, doc: Document): () => void {
  syncTheme(host, doc);
  const observer = new MutationObserver(() => {
    syncTheme(host, doc);
  });
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  return () => {
    observer.disconnect();
  };
}
