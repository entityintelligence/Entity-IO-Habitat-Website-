export type FieldZone = "top" | "join" | "story" | "plot" | "ask";

export type FieldCell = {
  col: number;
  row: number;
  zone: FieldZone;
  kit?: boolean;
};

const KIT_AT = new Set([
  "2,2",
  "4,2",
  "3,4",
  "5,4",
  "6,5",
  "4,6",
  "6,6",
  "1,7",
  "3,8",
]);

function pushCell(cells: FieldCell[], col: number, row: number, zone: FieldZone) {
  cells.push({ col, row, zone, kit: KIT_AT.has(`${col},${row}`) });
}

export function buildField() {
  const cells: FieldCell[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      pushCell(cells, col, row, "top");
    }
  }

  for (let row = 3; row <= 4; row += 1) {
    for (let col = 3; col <= 6; col += 1) {
      if (row === 3 && col === 6) continue;
      pushCell(cells, col, row, "join");
    }
  }

  for (let row = 5; row <= 6; row += 1) {
    for (let col = 3; col <= 6; col += 1) pushCell(cells, col, row, "story");
  }
  for (let row = 7; row <= 8; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      if (row === 8 && col === 6) continue;
      pushCell(cells, col, row, "story");
    }
  }

  for (let row = 9; row <= 13; row += 1) {
    if (row === 11) {
      for (let col = 0; col <= 6; col += 1) pushCell(cells, col, row, "plot");
      continue;
    }
    const start = row >= 10 ? 0 : 3;
    for (let col = start; col <= 6; col += 1) {
      if (col === 6 && (row === 10 || row === 12)) continue;
      if (col === 1 && row === 12) continue;
      pushCell(cells, col, row, "plot");
    }
  }

  for (let row = 14; row <= 18; row += 1) {
    const start = row <= 15 ? 0 : 3;
    for (let col = start; col <= 6; col += 1) {
      if (col === 6 && (row === 14 || row === 15)) continue;
      if (row === 15 && col <= 2) continue;
      pushCell(cells, col, row, "ask");
    }
  }

  const indexAt = (col: number, row: number) => cells.findIndex((cell) => cell.col === col && cell.row === row);

  return {
    cells,
    topHome: indexAt(0, 2),
    storyHome: indexAt(0, 7),
    storyAt: 5,
  };
}

export function neighborIndex(
  cells: FieldCell[],
  at: number,
  dc: number,
  dr: number,
  pass?: (cell: FieldCell) => boolean,
) {
  const cell = cells[at];
  if (!cell) return -1;
  const next = cells.findIndex((item) => item.col === cell.col + dc && item.row === cell.row + dr);
  if (next < 0) return -1;
  if (pass && !pass(cells[next])) return -1;
  return next;
}

export function cellOpen(cell: FieldCell, kitOn: boolean) {
  return kitOn || !cell.kit;
}

export function nearestOpen(cells: FieldCell[], at: number, kitOn: boolean) {
  const here = cells[at];
  if (!here) return at;
  if (cellOpen(here, kitOn)) return at;
  let best = at;
  let bestD = Number.POSITIVE_INFINITY;
  cells.forEach((cell, index) => {
    if (!cellOpen(cell, kitOn)) return;
    const d = Math.abs(cell.col - here.col) + Math.abs(cell.row - here.row);
    if (d < bestD) {
      bestD = d;
      best = index;
    }
  });
  return best;
}
