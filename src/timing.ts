export const VISIT_WINDOW_MS = 4 * 60 * 60 * 1000;

export function isNewVisit(lastShown: number | undefined, now: number): boolean {
  return lastShown === undefined || now - lastShown >= VISIT_WINDOW_MS;
}
