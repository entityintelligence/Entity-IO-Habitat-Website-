export type Session = {
  id: number;
  title: string;
  genre: string;
  tags: string[];
  body: string;
  brief: string;
  bloom: number[];
  acts: { who: string; line: string }[];
};

/** Angular foci the living mark expands around. Distinct questions light distinct regions. */
export const FORM = [
  { id: 0, a: -Math.PI / 2, spread: 0.78, amp: 0.82 },
  { id: 1, a: 2.42, spread: 0.7, amp: 0.8 },
  { id: 2, a: 0.7, spread: 0.66, amp: 0.76 },
  { id: 3, a: Math.PI * 0.95, spread: 0.74, amp: 0.84 },
] as const;

export const SESSIONS_COPY: Session[] = [
  {
    id: 0,
    title: "Attention 0004",
    genre: "attention",
    tags: ["delay", "site 04", "critical path", "capacity", "decision"],
    brief: "Site 04 is holding the critical path. Confirmation slipped thirty-six hours.",
    bloom: [0, 1, 2],
    body: "Site 04 is holding the critical path. Confirmation slipped thirty-six hours. Field capacity waits. Commissioning moves unless the path is rewritten.",
    acts: [
      { who: "you", line: "approve the alternate supplier, or accept a three-day shift." },
      { who: "procurement", line: "confirm inbound within 36 hours so field capacity can release." },
      { who: "delivery", line: "hold commissioning until the path is coherent again." },
    ],
  },
  {
    id: 1,
    title: "Attention 0011",
    genre: "work",
    tags: ["resource", "plant", "collision", "critical path", "objective"],
    brief: "Two pathways have claimed the same plant this week. The entity cannot walk both.",
    bloom: [1],
    body: "Two pathways have claimed the same plant this week. The entity cannot walk both. One objective will recede unless capacity is reallocated against the system state.",
    acts: [
      { who: "you", line: "name which objective holds. the other pathway yields." },
      { who: "operations", line: "release plant from the lesser path before first shift." },
      { who: "planning", line: "rewrite the displaced pathway so its dependents are not surprised." },
    ],
  },
  {
    id: 2,
    title: "Attention 0018",
    genre: "governance",
    tags: ["governance", "approval", "pathway", "critical path", "hold"],
    brief: "A governed gate is still open. Work has already arrived at it.",
    bloom: [2],
    body: "A governed gate is still open. Work has already arrived at it. The path cannot proceed, and every node bound to it is waiting on a signature that has not yet been given.",
    acts: [
      { who: "you", line: "approve, refuse, or send the package back with a condition." },
      { who: "governance", line: "place the decision against the live entity, not a static document." },
      { who: "field", line: "hold the crew at the gate. do not invent an unofficial path." },
    ],
  },
  {
    id: 3,
    title: "Fleet 0007",
    genre: "plant",
    tags: ["vehicle", "allocation", "today", "plant", "path"],
    brief: "The live path is on the 8-tonne. The other two stay at compound.",
    bloom: [3],
    body: "Today’s work is riding the 8-tonne. Two other vehicles are booked against paths that have not yet cleared the gate, so they stay at compound. The entity is one body of plant, not a list of keys.",
    acts: [
      { who: "you", line: "hold the 8-tonne to Site 04 until the delay is rewritten." },
      { who: "plant", line: "do not release the crew cab to the colliding pathway." },
      { who: "field", line: "the compound holds the rest. do not improvise a second fleet." },
    ],
  },
  {
    id: 4,
    title: "Footprint 0001",
    genre: "state",
    tags: ["entity", "modules", "gates", "flow", "capacity"],
    brief: "The entity is one modulated flow. Modules swell by what they carry; gates hold the path.",
    bloom: [0, 1, 2, 3],
    body: "The entity is one modulated flow: intelligence, resource and mechanical work, sized by what they actually carry. Vectors move capacity. Gates hold the path until a decision is given. The mark is still the same body — unfolded into the footprint.",
    acts: [
      { who: "you", line: "read the footprint as one organism, not a list of departments." },
      { who: "intelligence", line: "keep prediction on the live flow, not a static chart." },
      { who: "operations", line: "do not add a module that the gates cannot admit." },
    ],
  },
];
