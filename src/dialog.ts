import { icons, type IconName } from "./icons";
import { styles } from "./styles";

interface Action {
  label: string;
  href: string;
  icon: IconName;
  primary?: boolean;
}

const ACTIONS: readonly Action[] = [
  { label: "Call 988", href: "tel:988", icon: "phone", primary: true },
  { label: "Text 988", href: "sms:988", icon: "text" },
  { label: "Chat", href: "https://988lifeline.org/chat/", icon: "chat" },
  { label: "Official Website", href: "https://988lifeline.org/", icon: "globe" },
];

const HOST_ID = "lakeium-help";
const SVG_NS = "http://www.w3.org/2000/svg";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", icons[name]);
  svg.append(path);
  return svg;
}

function actionLink(action: Action): HTMLAnchorElement {
  const link = el("a", action.primary ? "action primary" : "action");
  link.href = action.href;
  if (action.href.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  link.append(icon(action.icon), el("span", undefined, action.label));
  return link;
}

function buildDialog(onClose: () => void): HTMLElement {
  const dialog = el("div", "dialog");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "lakeium-title");
  dialog.tabIndex = -1;

  const close = el("button", "close");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.append(icon("close"));
  close.addEventListener("click", onClose);

  const title = el("h2", "title", "Help is available");
  title.id = "lakeium-title";

  const details = el("dl", "details");
  details.append(el("dt", undefined, "Languages:"), el("dd", undefined, "English, Spanish"));
  details.append(el("dt", undefined, "Hours:"), el("dd", undefined, "24/7"));

  const actions = el("div", "actions");
  actions.append(...ACTIONS.map(actionLink));

  const head = el("div", "head");
  head.append(title, el("p", "subtitle", "Speak with someone today"));
  const body = el("div", "body");
  body.append(el("p", "service", "988 Suicide and Crisis Lifeline"), details, actions);

  dialog.append(close, head, body);
  return dialog;
}

export function isHelpOpen(doc: Document = document): boolean {
  return doc.getElementById(HOST_ID) !== null;
}

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

/** Copies the site's current --lc-* values onto the host so light and dark themes carry over. */
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
 * Mounts on <body>, outside the SvelteKit app container, so hydration and
 * client-side re-renders can't remove it. Theme variables are mirrored instead of inherited.
 */
export function showHelp(doc: Document = document): boolean {
  if (isHelpOpen(doc)) return false;
  const host = doc.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });

  const previousFocus = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") dismiss();
  };
  const themeWatcher = new MutationObserver(() => {
    syncTheme(host, doc);
  });
  function dismiss(): void {
    doc.removeEventListener("keydown", onKey, true);
    themeWatcher.disconnect();
    host.remove();
    previousFocus?.focus();
  }

  const style = el("style");
  style.textContent = styles;
  const overlay = el("div", "overlay");
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) dismiss();
  });
  const dialog = buildDialog(dismiss);
  overlay.append(dialog);
  shadow.append(style, overlay);

  doc.body.append(host);
  syncTheme(host, doc);
  themeWatcher.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  doc.addEventListener("keydown", onKey, true);
  dialog.focus();
  return true;
}
