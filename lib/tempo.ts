export const TEMPO_CRUISE = 5.5;
export const TEMPO_WIND = 2.55;
export const TEMPO_STROBE = 0.42;
export const TEMPO_WHITE = 0.07;
export const TEMPO_GONE = 2.15;
export const TEMPO_IN = 0.06;
export const TEMPO_SETTLE = 0.22;
export const TEMPO_PERIOD =
  TEMPO_CRUISE + TEMPO_WIND + TEMPO_STROBE + TEMPO_WHITE + TEMPO_GONE + TEMPO_IN + TEMPO_SETTLE;

let origin = 0;

export function tempoTime() {
  if (!origin) origin = performance.now();
  return (performance.now() - origin) / 1000;
}

export function tempoPresence(t: number) {
  const u = t % TEMPO_PERIOD;
  if (u < TEMPO_CRUISE) return { vis: 1, rev: 0, flash: 0 };
  if (u < TEMPO_CRUISE + TEMPO_WIND) {
    const k = (u - TEMPO_CRUISE) / TEMPO_WIND;
    return { vis: 1, rev: k * k * k * k, flash: 0 };
  }
  if (u < TEMPO_CRUISE + TEMPO_WIND + TEMPO_STROBE) {
    const k = (u - TEMPO_CRUISE - TEMPO_WIND) / TEMPO_STROBE;
    const dip =
      (k > 0.14 && k < 0.22) ||
      (k > 0.4 && k < 0.5) ||
      (k > 0.68 && k < 0.74);
    return { vis: dip ? 0 : 1, rev: 1, flash: 0 };
  }
  if (u < TEMPO_CRUISE + TEMPO_WIND + TEMPO_STROBE + TEMPO_WHITE) {
    return { vis: 1, rev: 1, flash: 1 };
  }
  if (u < TEMPO_CRUISE + TEMPO_WIND + TEMPO_STROBE + TEMPO_WHITE + TEMPO_GONE) {
    return { vis: 0, rev: 0, flash: 0 };
  }
  const afterGone = TEMPO_CRUISE + TEMPO_WIND + TEMPO_STROBE + TEMPO_WHITE + TEMPO_GONE;
  if (u < afterGone + TEMPO_IN) return { vis: 1, rev: 0, flash: 1 };
  const k = (u - afterGone - TEMPO_IN) / TEMPO_SETTLE;
  return { vis: 1, rev: 0, flash: 1 - k * k };
}
