import { describe, expect, it } from "vitest";
import { isNewVisit, VISIT_WINDOW_MS } from "./timing";

describe("isNewVisit", () => {
  it("is a new visit when never shown", () => {
    expect(isNewVisit(undefined, 1000)).toBe(true);
  });

  it("is not a new visit inside the four hour window", () => {
    expect(isNewVisit(0, VISIT_WINDOW_MS - 1)).toBe(false);
  });

  it("is a new visit once four hours pass", () => {
    expect(isNewVisit(0, VISIT_WINDOW_MS)).toBe(true);
  });
});
