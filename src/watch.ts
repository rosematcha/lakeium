const ENDED = 0;
// Normal playback reports progress about every quarter second; anything bigger is a seek.
const MAX_STEP_S = 1.5;
const END_TOLERANCE_S = 1;

export interface PlayerInfo {
  currentTime: number | undefined;
  duration: number | undefined;
  playerState: number | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function parseJson(data: unknown): unknown {
  if (typeof data !== "string") return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/** Reads the YouTube embed's postMessage payloads (infoDelivery and onStateChange). */
export function readPlayerInfo(data: unknown): PlayerInfo | null {
  const message = parseJson(data);
  if (!isRecord(message)) return null;
  if (message.event === "onStateChange") {
    return { currentTime: undefined, duration: undefined, playerState: num(message.info) };
  }
  if (message.event !== "infoDelivery" || !isRecord(message.info)) return null;
  const { info } = message;
  return { currentTime: num(info.currentTime), duration: num(info.duration), playerState: num(info.playerState) };
}

interface WatchProgress {
  done: boolean;
  progress: number;
}

/**
 * Tracks the furthest point reached through continuous playback, so seeking
 * ahead doesn't count. Done only once playback ends having covered the whole video.
 */
export function createWatchTracker(): (info: PlayerInfo) => WatchProgress {
  let watched = 0;
  let duration = 0;
  let done = false;
  return (info) => {
    if (info.duration) duration = info.duration;
    const time = info.currentTime;
    if (time !== undefined && time <= watched + MAX_STEP_S) watched = Math.max(watched, time);
    const covered = duration > 0 && watched >= duration - END_TOLERANCE_S;
    if (covered && info.playerState === ENDED) done = true;
    return { done, progress: duration > 0 ? Math.min(watched / duration, 1) : 0 };
  };
}
