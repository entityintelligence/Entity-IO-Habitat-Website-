"use client";

import { useEffect, useState } from "react";
import { usePlace } from "@/components/place";

export function readClock(zone: string | null) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: zone ?? undefined,
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("hour")}:${get("minute")}.${get("second")}`;
}

export function TimeRead() {
  const { zone } = usePlace();
  const [now, setNow] = useState(() => readClock(zone));

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setNow(readClock(zone));
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [zone]);

  return (
    <time className="land-time" dateTime={now.replace(".", ":")} aria-label="Local time" suppressHydrationWarning>
      {now}
    </time>
  );
}
