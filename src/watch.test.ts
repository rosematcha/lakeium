import { describe, expect, it } from "vitest";
import { createWatchTracker, readPlayerInfo, type PlayerInfo } from "./watch";

const PLAYING = 1;
const ENDED = 0;

const info = (currentTime: number | undefined, playerState: number | undefined = PLAYING): PlayerInfo => ({
  currentTime,
  duration: 30,
  playerState,
});

describe("readPlayerInfo", () => {
  it("reads infoDelivery payloads", () => {
    const data = JSON.stringify({ event: "infoDelivery", info: { currentTime: 3, duration: 30, playerState: 1 } });
    expect(readPlayerInfo(data)).toEqual({ currentTime: 3, duration: 30, playerState: 1 });
  });

  it("reads onStateChange payloads", () => {
    expect(readPlayerInfo(JSON.stringify({ event: "onStateChange", info: 0 }))?.playerState).toBe(0);
  });

  it("ignores unrelated or malformed messages", () => {
    expect(readPlayerInfo("not json")).toBeNull();
    expect(readPlayerInfo({ event: "infoDelivery" })).toBeNull();
    expect(readPlayerInfo(JSON.stringify({ event: "somethingElse" }))).toBeNull();
  });
});

describe("createWatchTracker", () => {
  it("completes after continuous playback to the end", () => {
    const track = createWatchTracker();
    for (let t = 0; t <= 30; t += 0.5) track(info(t));
    expect(track(info(30, ENDED)).done).toBe(true);
  });

  it("does not count seeking ahead", () => {
    const track = createWatchTracker();
    track(info(0));
    track(info(29.5));
    const result = track(info(30, ENDED));
    expect(result.done).toBe(false);
    expect(result.progress).toBe(0);
  });

  it("is not done before playback ends", () => {
    const track = createWatchTracker();
    let last = track(info(0));
    for (let t = 0; t <= 30; t += 0.5) last = track(info(t));
    expect(last.done).toBe(false);
    expect(last.progress).toBe(1);
  });

  it("allows rewatching earlier parts", () => {
    const track = createWatchTracker();
    for (let t = 0; t <= 10; t += 0.5) track(info(t));
    track(info(2));
    for (let t = 2; t <= 30; t += 0.5) track(info(t));
    expect(track(info(30, ENDED)).done).toBe(true);
  });
});
