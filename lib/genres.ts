export type Genre = {
  id: string;
  label: string;
  /** Index into the living forms sheet (1–9). The idle mark is 0. */
  form: number;
  session: number;
  keys: string[];
};

/** One shape per operating genre — learnt by asking, then recognised on sight. */
export const GENRES: Genre[] = [
  {
    id: "attention",
    label: "Attention",
    form: 1,
    session: 0,
    keys: ["attention", "today", "needs my", "problem later", "behind"],
  },
  {
    id: "work",
    label: "Work",
    form: 2,
    session: 1,
    keys: ["project", "projects", "at risk", "prioritise", "prioritize", "objective"],
  },
  {
    id: "plant",
    label: "Plant",
    form: 3,
    session: 3,
    keys: ["plant", "fleet", "vehicle", "crane", "capacity", "crew", "resource"],
  },
  {
    id: "flow",
    label: "Flow",
    form: 4,
    session: 1,
    keys: ["flow", "logistics", "inbound", "supplier", "affected", "constrained", "constraint"],
  },
  {
    id: "governance",
    label: "Governance",
    form: 5,
    session: 2,
    keys: ["decision", "decisions", "gate", "approval", "approve", "signature", "govern"],
  },
  {
    id: "path",
    label: "Path",
    form: 7,
    session: 0,
    keys: ["critical path", "commissioning", "delay", "pathway", "site 04"],
  },
  {
    id: "state",
    label: "State",
    form: 8,
    session: 0,
    keys: ["briefing", "changed", "yesterday", "current state", "organisation", "organization"],
  },
  {
    id: "automation",
    label: "Automation",
    form: 9,
    session: 2,
    keys: ["manual", "automate", "repeatedly"],
  },
];

export function matchGenre(text: string): Genre | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  let best: Genre | null = null;
  let bestLen = 0;
  for (const g of GENRES) {
    for (const key of g.keys) {
      if (q.includes(key) && key.length > bestLen) {
        best = g;
        bestLen = key.length;
      }
    }
  }
  return best;
}

export function genreById(id: string | undefined) {
  return GENRES.find((g) => g.id === id) ?? null;
}
