import { genreById, matchGenre } from "@/lib/genres";
import type { HabitatView } from "@/lib/layers";
import { matchQuestion } from "@/lib/questions";
import { SESSIONS_COPY, type Session } from "@/lib/sessions";

export type Posture = "attention" | "progressive" | "conservative";

export type KitReply = {
  text: string;
  fit: boolean;
  session: Session | null;
  bloom: number[];
  form: number;
  genre?: string;
  habitatView?: HabitatView;
  partId?: string | null;
};

const empty: KitReply = { text: "", fit: false, session: null, bloom: [], form: 0 };

function focus(foundId: number | undefined, genreId: string | undefined): {
  habitatView: HabitatView;
  partId: string | null;
} {
  if (foundId === 10 || foundId === 9) return { habitatView: "ecosystems", partId: null };
  if (foundId === 4 || foundId === 8) return { habitatView: "intelligence", partId: "concierge" };
  if (foundId === 3) return { habitatView: "resource", partId: "res-people" };
  if (foundId === 2 || foundId === 7) return { habitatView: "mechanical", partId: "eco-003" };
  if (foundId === 0 || foundId === 5 || foundId === 6) return { habitatView: "ecosystems", partId: "eco-002" };
  if (genreId === "governance" || genreId === "automation") return { habitatView: "intelligence", partId: "concierge" };
  if (genreId === "flow" || genreId === "plant") return { habitatView: "resource", partId: "res-matter" };
  if (genreId === "work") return { habitatView: "mechanical", partId: "eco-003" };
  return { habitatView: "ecosystems", partId: null };
}

export function replyTo(question: string, _posture: Posture): KitReply {
  const found = matchQuestion(question);
  const genre = found && "genre" in found ? genreById(found.genre) : matchGenre(question);

  if (!found && !genre) {
    const q = question.trim();
    if (!q) return empty;
    return {
      text: "Press a mass on the Habitat, or change a layer.",
      fit: true,
      session: null,
      bloom: [],
      form: 0,
    };
  }

  const session = SESSIONS_COPY[found?.session ?? genre?.session ?? 0] ?? null;
  const tagged = session && genre ? { ...session, genre: genre.id } : session;
  const next = focus(found?.id, genre?.id);

  if (found?.id === 10) {
    return {
      text: "This is the nested form. Press a mass to read a component.",
      fit: true,
      session: null,
      bloom: [],
      form: 0,
      genre: genre?.id,
      ...next,
    };
  }

  return {
    text: tagged?.brief ?? "",
    fit: true,
    session: tagged,
    bloom: tagged?.bloom ?? [],
    form: 0,
    genre: genre?.id,
    ...next,
  };
}
