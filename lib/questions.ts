export const QUESTIONS = [
  {
    id: 0,
    q: "What needs my attention — and what happens if I ignore it?",
    keys: ["needs my attention", "attention today", "if i ignore", "ignore it"],
    session: 0,
    genre: "attention",
  },
  {
    id: 1,
    q: "What has materially changed in the business since yesterday?",
    keys: ["materially changed", "since yesterday"],
    session: 0,
    genre: "state",
  },
  {
    id: 2,
    q: "Which projects are most at risk right now, and why?",
    keys: ["most at risk", "at risk right now"],
    session: 1,
    genre: "work",
  },
  {
    id: 3,
    q: "Where are we currently constrained?",
    keys: ["currently constrained", "where are we currently constrained"],
    session: 1,
    genre: "flow",
  },
  {
    id: 4,
    q: "What decisions are waiting to be made?",
    keys: ["decisions are waiting", "waiting to be made"],
    session: 2,
    genre: "governance",
  },
  {
    id: 5,
    q: "What are we doing right now that is likely to cause a problem later?",
    keys: ["problem later", "cause a problem"],
    session: 0,
    genre: "path",
  },
  {
    id: 6,
    q: "Why is Project X behind?",
    keys: ["project x behind", "why is project"],
    session: 0,
    genre: "work",
  },
  {
    id: 7,
    q: "If we prioritise Project X, what else will be affected?",
    keys: ["prioritise project", "prioritize project", "what else will be affected"],
    session: 1,
    genre: "flow",
  },
  {
    id: 8,
    q: "What work are we repeatedly doing manually that Entity could automate?",
    keys: ["repeatedly doing", "could automate", "manually"],
    session: 2,
    genre: "automation",
  },
  {
    id: 9,
    q: "Give me a complete briefing on the current state of the business.",
    keys: ["complete briefing", "current state of the business"],
    session: 0,
    genre: "state",
  },
  {
    id: 10,
    q: "Show me the entity footprint.",
    keys: [
      "entity footprint",
      "show me the entity",
      "show the entity",
      "the footprint",
      "entity as a system",
      "holding environment",
    ],
    session: 4,
    genre: "state",
  },
  {
    id: 11,
    q: "Show me where this is going.",
    keys: ["where this is going", "show me where this"],
    session: 0,
    genre: "path",
  },
  {
    id: 12,
    q: "If I approve the path, what runs without me?",
    keys: ["approve the path", "runs without me"],
    session: 1,
    genre: "automation",
  },
] as const;

export function matchQuestion(text: string) {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  const exact = QUESTIONS.find((item) => item.q.toLowerCase() === q);
  if (exact) return exact;
  let best: (typeof QUESTIONS)[number] | null = null;
  let bestLen = 0;
  for (const item of QUESTIONS) {
    for (const key of item.keys) {
      if (q.includes(key) && key.length > bestLen) {
        best = item;
        bestLen = key.length;
      }
    }
  }
  return best;
}
