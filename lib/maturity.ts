export type MaturityLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Acatech Industrie 4.0 maturity index, mapped to KIT’s planning path. */
export const MATURITY: {
  level: MaturityLevel;
  label: string;
  verb: string;
  body: string;
}[] = [
  {
    level: 1,
    label: "Computerised",
    verb: "Digitise the record.",
    body: "Work exists as files. The entity is still inferred from documents.",
  },
  {
    level: 2,
    label: "Connected",
    verb: "Bind the silos to one bus.",
    body: "Systems speak. The body is not yet one field — only linked fragments.",
  },
  {
    level: 3,
    label: "Visible",
    verb: "See the live entity.",
    body: "Present state can be read as one body. Looking is enough to begin.",
  },
  {
    level: 4,
    label: "Transparent",
    verb: "See why the state is the state.",
    body: "Cause is named. Site 04 is not a symptom — it is a path through the Habitat.",
  },
  {
    level: 5,
    label: "Predictive",
    verb: "See the path before the damage.",
    body: "Present, desired, one path to take and one to refuse — before commissioning slips.",
  },
  {
    level: 6,
    label: "Adaptive",
    verb: "Approve once. The system carries the rest.",
    body: "Automation with governance. Packages issue themselves. Human attention returns to decision.",
  },
];

/** This demonstration sits at transparency, leaning into prediction. */
export const MATURITY_NOW: MaturityLevel = 4;
