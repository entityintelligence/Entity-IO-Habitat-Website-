"use client";

import { useEffect, useState } from "react";
import { formatWaiting } from "@/lib/wait-count-format";

export function WaitCount({
  initial,
  tone = "quiet",
}: {
  initial?: number;
  tone?: "quiet" | "hero";
}) {
  const [n, setN] = useState(initial ?? 0);

  useEffect(() => {
    const load = () => {
      fetch("/api/waitlist")
        .then((res) => res.json() as Promise<{ waiting?: number }>)
        .then((json) => {
          if (typeof json.waiting === "number") setN(json.waiting);
        })
        .catch(() => undefined);
    };
    if (initial == null) load();
    window.addEventListener("waitlist:join", load);
    return () => window.removeEventListener("waitlist:join", load);
  }, [initial]);

  if (tone === "hero") {
    return (
      <p className="wait-hero">
        <span className="mono">Waiting</span>
        <strong>{formatWaiting(n)}</strong>
        <em>operators on the list</em>
      </p>
    );
  }

  return (
    <span className="wait-quiet mono" title="Operators on the founding waitlist">
      WAIT {formatWaiting(n)}
    </span>
  );
}
