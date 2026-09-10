export const WAIT_MS = 60 * 60 * 1000;

export function isDue(lastShown: number | undefined, now: number): boolean {
  return lastShown === undefined || now - lastShown >= WAIT_MS;
}
