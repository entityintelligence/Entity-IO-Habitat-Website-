export function formatWaiting(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(3, "0");
}
