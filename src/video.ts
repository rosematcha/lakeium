import { mirrorTheme } from "./theme";
import { createWatchTracker, readPlayerInfo } from "./watch";

const HOST_ID = "lakeium-trolley";
const VIDEO_ID = "3U40ngOGJpY";
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";
const PLAYER_ORIGINS = new Set([EMBED_ORIGIN, "https://www.youtube.com"]);

const styles = `
:host { all: initial; }
.pane {
  box-sizing: border-box; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px;
  background: var(--lc-bg-two, #f9f9f9); color: var(--lc-text, #222);
  font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.frame {
  flex: 1; min-height: 0; aspect-ratio: 9 / 16; max-width: 100%;
  overflow: hidden; background: #000;
  border: 2px solid var(--lc-border, #c7c7c7); border-radius: 8px;
}
iframe { display: block; width: 100%; height: 100%; border: 0; }
.caption { font-size: 14px; font-weight: 700; }
.meter { width: 100%; max-width: 260px; height: 6px; border-radius: 3px; overflow: hidden; background: var(--lc-el, #ebebeb); }
.fill { width: 0; height: 100%; background: var(--lc-primary, #a41c32); transition: width .3s linear; }
`;

export function isVideoActive(doc: Document = document): boolean {
  return doc.getElementById(HOST_ID) !== null;
}

function embedUrl(origin: string): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    controls: "0",
    disablekb: "1",
    playsinline: "1",
    rel: "0",
    origin,
  });
  return `${EMBED_ORIGIN}/embed/${VIDEO_ID}?${params.toString()}`;
}

function placeOver(host: HTMLElement, target: Element | null): void {
  const rect = target?.getBoundingClientRect();
  if (!rect || rect.width === 0) {
    host.style.display = "none";
    return;
  }
  Object.assign(host.style, {
    display: "block",
    top: `${String(rect.top)}px`,
    left: `${String(rect.left)}px`,
    width: `${String(rect.width)}px`,
    height: `${String(rect.height)}px`,
  });
}

/** Keeps the host covering the card results pane every frame; it hides while the pane is absent. */
function followResults(host: HTMLElement, doc: Document): () => void {
  let frame = 0;
  const tick = (): void => {
    placeOver(host, doc.querySelector(".search-results"));
    frame = requestAnimationFrame(tick);
  };
  tick();
  return () => {
    cancelAnimationFrame(frame);
  };
}

function buildPane(doc: Document): { pane: HTMLElement; iframe: HTMLIFrameElement; fill: HTMLElement } {
  const pane = doc.createElement("div");
  pane.className = "pane";
  const frame = doc.createElement("div");
  frame.className = "frame";
  const iframe = doc.createElement("iframe");
  iframe.src = embedUrl(doc.location.origin);
  iframe.title = "Precious Trolley";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  frame.append(iframe);
  const caption = doc.createElement("p");
  caption.className = "caption";
  caption.textContent = "Watch to continue";
  const meter = doc.createElement("div");
  meter.className = "meter";
  const fill = doc.createElement("div");
  fill.className = "fill";
  meter.append(fill);
  pane.append(frame, caption, meter);
  return { pane, iframe, fill };
}

/** Asks the embed to start posting playback info to this window. */
function subscribe(iframe: HTMLIFrameElement): void {
  iframe.addEventListener("load", () => {
    iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: HOST_ID, channel: "widget" }), EMBED_ORIGIN);
  });
}

/**
 * Covers the card results with the video until it has been watched through.
 * Mounted on <body> like the dialog so SvelteKit re-renders can't remove it.
 */
export function showTrolleyVideo(onDone: () => void, doc: Document = document): boolean {
  if (isVideoActive(doc)) return false;
  const win = doc.defaultView ?? window;
  const host = doc.createElement("div");
  host.id = HOST_ID;
  host.style.position = "fixed";
  host.style.zIndex = "20";
  const shadow = host.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = styles;
  const { pane, iframe, fill } = buildPane(doc);
  shadow.append(style, pane);
  subscribe(iframe);
  doc.body.append(host);

  const stopTheme = mirrorTheme(host, doc);
  const stopFollowing = followResults(host, doc);
  const track = createWatchTracker();
  const onMessage = (event: MessageEvent): void => {
    if (!PLAYER_ORIGINS.has(event.origin)) return;
    const info = readPlayerInfo(event.data);
    if (!info) return;
    const { done, progress } = track(info);
    fill.style.width = `${String(progress * 100)}%`;
    if (!done) return;
    win.removeEventListener("message", onMessage);
    stopFollowing();
    stopTheme();
    host.remove();
    onDone();
  };
  win.addEventListener("message", onMessage);
  return true;
}
