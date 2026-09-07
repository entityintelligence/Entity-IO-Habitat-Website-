export type TourBeat = "see" | "predict" | "seat" | "approve";

export const TOUR_STARTS = [
  "What needs my attention — and what happens if I ignore it?",
  "Show me where this is going.",
  "If I approve the path, what runs without me?",
] as const;

export const TOUR_COPY: Record<
  TourBeat,
  { whisper: string; kicker: string; title: string; lede: string; next?: { label: string; beat: TourBeat } }
> = {
  see: {
    whisper: "see · the entity",
    kicker: "KIT · prediction",
    title: "This is the entity. Looking is enough.",
    lede: "Not a dashboard. One body. What is at risk is already in the field.",
    next: { label: "Show me where this is going", beat: "predict" },
  },
  predict: {
    whisper: "predict · now and desired",
    kicker: "KIT · prediction",
    title: "Present. Desired. One path to take, one to refuse.",
    lede: "Commissioning can still be held. The dim thread is the three-week slip if you do nothing.",
    next: { label: "Seat the business", beat: "seat" },
  },
  seat: {
    whisper: "seat · the habitat",
    kicker: "KIT · the body",
    title: "The real business sits in the Habitat.",
    lede: "Conversation, records, model, live feed — one seat. Prediction now has a body.",
    next: { label: "If I approve the path, what runs without me?", beat: "approve" },
  },
  approve: {
    whisper: "approve · automation",
    kicker: "KIT · automation",
    title: "Approve once. The system carries the rest.",
    lede: "Hold commissioning. Packages go to you, procurement, and the field. The burden left the person.",
  },
};
