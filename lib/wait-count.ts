import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "waitlist.json");

export function waitOffset() {
  const n = Number(process.env.WAITLIST_OFFSET ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function readWaitlist(): Promise<unknown[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function appendWaitlist(record: unknown) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const existing = await readWaitlist();
  existing.push(record);
  await writeFile(FILE, JSON.stringify(existing, null, 2));
}

export async function waitingCount() {
  return waitOffset() + (await readWaitlist()).length;
}
