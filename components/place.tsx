"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export const places = [
  { id: "sydney", label: "Sydney", zone: "Australia/Sydney" },
  { id: "melbourne", label: "Melbourne", zone: "Australia/Melbourne" },
  { id: "brisbane", label: "Brisbane", zone: "Australia/Brisbane" },
  { id: "perth", label: "Perth", zone: "Australia/Perth" },
  { id: "adelaide", label: "Adelaide", zone: "Australia/Adelaide" },
  { id: "auckland", label: "Auckland", zone: "Pacific/Auckland" },
  { id: "wellington", label: "Wellington", zone: "Pacific/Auckland" },
  { id: "singapore", label: "Singapore", zone: "Asia/Singapore" },
  { id: "london", label: "London", zone: "Europe/London" },
  { id: "manchester", label: "Manchester", zone: "Europe/London" },
  { id: "edinburgh", label: "Edinburgh", zone: "Europe/London" },
  { id: "dublin", label: "Dublin", zone: "Europe/Dublin" },
  { id: "new-york", label: "New York", zone: "America/New_York" },
  { id: "los-angeles", label: "Los Angeles", zone: "America/Los_Angeles" },
  { id: "chicago", label: "Chicago", zone: "America/Chicago" },
  { id: "san-francisco", label: "San Francisco", zone: "America/Los_Angeles" },
  { id: "toronto", label: "Toronto", zone: "America/Toronto" },
  { id: "vancouver", label: "Vancouver", zone: "America/Vancouver" },
  { id: "johannesburg", label: "Johannesburg", zone: "Africa/Johannesburg" },
  { id: "cape-town", label: "Cape Town", zone: "Africa/Johannesburg" },
] as const;

export type PlaceId = (typeof places)[number]["id"];

const DEFAULT_PLACE: PlaceId = "sydney";

const PlaceContext = createContext<{
  place: PlaceId;
  zone: string;
  setPlace: (id: PlaceId) => void;
}>({
  place: DEFAULT_PLACE,
  zone: "Australia/Sydney",
  setPlace: () => undefined,
});

function apply(id: PlaceId) {
  try {
    localStorage.setItem("kit-place", id);
  } catch {
    /* ignore */
  }
}

export function PlaceProvider({ children }: { children: React.ReactNode }) {
  const [place, setPlaceState] = useState<PlaceId>(DEFAULT_PLACE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kit-place");
      if (places.some((item) => item.id === stored)) setPlaceState(stored as PlaceId);
    } catch {
      /* ignore */
    }
  }, []);

  const zone = places.find((item) => item.id === place)?.zone ?? places[0].zone;

  const value = useMemo(
    () => ({
      place,
      zone,
      setPlace: (id: PlaceId) => {
        setPlaceState(id);
        apply(id);
      },
    }),
    [place, zone],
  );

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>;
}

export function usePlace() {
  return useContext(PlaceContext);
}

export function PlaceToggle() {
  const { place, setPlace } = usePlace();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = places.find((item) => item.id === place)?.label ?? places[0].label;

  return (
    <div className="head-place" ref={rootRef} data-open={open ? "" : undefined}>
      <button
        type="button"
        className="head-globe"
        aria-expanded={open}
        aria-label={`Location: ${current}`}
        title={`Location: ${current}`}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="8" cy="8" rx="2.4" ry="6.25" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M1.75 8h12.5M3.1 5h9.8M3.1 11h9.8" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      {open ? (
        <div className="head-place-list">
          {places.map((item) => (
            <button
              key={item.id}
              type="button"
              className="head-link"
              aria-current={item.id === place ? "true" : undefined}
              onClick={() => {
                setPlace(item.id);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
