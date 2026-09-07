export type CellKind = "live" | "goal" | "option" | "other";

export const BOARD_COLS = 7;
export const BOARD_ROWS = 3;
export const BOARD_CELLS = BOARD_COLS * BOARD_ROWS;
export const AVATAR_AT = 14;

export function pathBetween(from: number, to: number) {
  if (from === to) return [];
  const steps: number[] = [];
  let row = Math.floor(from / BOARD_COLS);
  let col = from % BOARD_COLS;
  const rowTo = Math.floor(to / BOARD_COLS);
  const colTo = to % BOARD_COLS;
  while (col !== colTo) {
    col += colTo > col ? 1 : -1;
    steps.push(row * BOARD_COLS + col);
  }
  while (row !== rowTo) {
    row += rowTo > row ? 1 : -1;
    steps.push(row * BOARD_COLS + col);
  }
  return steps;
}

export function isOption(index: number, entityAt: number) {
  return index !== entityAt && index >= 0 && index < BOARD_CELLS;
}

export function kindOf(index: number, entityAt: number, goal: number | null): CellKind {
  if (index === entityAt) return "live";
  if (goal !== null && index === goal) return "goal";
  if (isOption(index, entityAt)) return "option";
  return "other";
}

export function nameOf(index: number, entityAt: number, goal: number | null) {
  if (index === entityAt) return "Present entity";
  if (goal !== null && index === goal) return "Intended state";
  return "Possible state";
}

export const SPEC_CELLS = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 7 }, (_, col) => ({ col: col + 1, row: row + 1 })),
)
  .flat()
  .filter(({ col, row }) => (col >= 4 || row >= 3) && !(col === 7 && row === 4));

export const SPEC_START = SPEC_CELLS.findIndex((cell) => cell.col === 1 && cell.row === 3);

function slotIndex(cells: { col: number; row: number }[], col: number, row: number) {
  return cells.findIndex((cell) => cell.col === col && cell.row === row);
}

type Slot = { col: number; row: number };

function openKeys(cells: Slot[], pass?: (cell: Slot, index: number) => boolean) {
  const open = new Set<string>();
  cells.forEach((cell, index) => {
    if (pass && !pass(cell, index)) return;
    open.add(`${cell.col},${cell.row}`);
  });
  return open;
}

function rookWalk(
  cells: Slot[],
  from: number,
  to: number,
  first: "h" | "v",
  pass?: (cell: Slot, index: number) => boolean,
) {
  const open = openKeys(cells, pass);
  let { col, row } = cells[from];
  const dest = cells[to];
  const steps: number[] = [];
  const moveH = () => {
    while (col !== dest.col) {
      col += dest.col > col ? 1 : -1;
      if (!open.has(`${col},${row}`)) return false;
      steps.push(slotIndex(cells, col, row));
    }
    return true;
  };
  const moveV = () => {
    while (row !== dest.row) {
      row += dest.row > row ? 1 : -1;
      if (!open.has(`${col},${row}`)) return false;
      steps.push(slotIndex(cells, col, row));
    }
    return true;
  };
  const ok = first === "h" ? moveH() && moveV() : moveV() && moveH();
  return ok ? steps : null;
}

function bfsWalk(cells: Slot[], from: number, to: number, pass?: (cell: Slot, index: number) => boolean) {
  const open = new Map<string, number>();
  cells.forEach((cell, index) => {
    if (pass && !pass(cell, index)) return;
    open.set(`${cell.col},${cell.row}`, index);
  });
  const seen = new Set([from]);
  const queue = [{ at: from, path: [] as number[] }];
  while (queue.length) {
    const cur = queue.shift();
    if (!cur) break;
    const { col, row } = cells[cur.at];
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const next = open.get(`${col + dc},${row + dr}`);
      if (next === undefined || seen.has(next)) continue;
      const path = [...cur.path, next];
      if (next === to) return path;
      seen.add(next);
      queue.push({ at: next, path });
    }
  }
  return [];
}

export function pathOnSlots(
  cells: Slot[],
  from: number,
  to: number,
  pass?: (cell: Slot, index: number) => boolean,
) {
  if (from === to) return [];
  if (pass && (!pass(cells[from], from) || !pass(cells[to], to))) return [];
  return (
    rookWalk(cells, from, to, "h", pass) ??
    rookWalk(cells, from, to, "v", pass) ??
    bfsWalk(cells, from, to, pass)
  );
}
