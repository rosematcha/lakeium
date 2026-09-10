import { describe, expect, it } from "vitest";
import { isDue, WAIT_MS } from "./timing";

describe("isDue", () => {
  it("is due when never shown", () => {
    expect(isDue(undefined, 1000)).toBe(true);
  });

  it("is not due inside the one hour wait", () => {
    expect(isDue(0, WAIT_MS - 1)).toBe(false);
  });

  it("is due once an hour passes", () => {
    expect(isDue(0, WAIT_MS)).toBe(true);
  });
});
