"use client";

import { useEffect, useState } from "react";
import { story } from "@/content/copy";

type Status = "idle" | "submitting" | "ok" | "error";
type Seat = (typeof story.paths)[number]["value"];

function padWaiting(n: number) {
  return String(n).padStart(3, "0");
}

export function WaitlistForm({ tone = "paper" }: { tone?: "paper" | "field" }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [seat, setSeat] = useState<Seat | "">("");
  const [waiting, setWaiting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data: { waiting?: number }) => {
        if (typeof data.waiting === "number") setWaiting(data.waiting);
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() || !seat) {
      form.reportValidity();
      return;
    }
    setStatus("submitting");
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (!data.name?.trim()) {
      data.name = (data.email ?? "").split("@")[0] || "Enquire";
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; waiting?: number };
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong.");
        return;
      }
      if (typeof json.waiting === "number") setWaiting(json.waiting);
      setStatus("ok");
      form.reset();
      window.dispatchEvent(new Event("waitlist:join"));
    } catch {
      setStatus("error");
      setMessage("Network error. Write to accounts@entityintelligence.io.");
    }
  }

  if (status === "ok") {
    return (
      <div className={tone === "field" ? "land-ask-ok" : "join-ok"}>
        <p className={tone === "field" ? "land-ask-ok-line" : "join-ok-title"}>{story.ok}</p>
        {tone !== "field" && waiting !== null ? (
          <p className="wait-count">
            {padWaiting(waiting)} {story.waiting}
          </p>
        ) : null}
        <button
          type="button"
          className={tone === "field" ? "land-ask-go" : "mono text-mute"}
          onClick={() => {
            setSeat("");
            setStatus("idle");
          }}
        >
          Back
        </button>
      </div>
    );
  }

  if (tone === "field") {
    return (
      <form onSubmit={onSubmit} className="land-ask-form">
        <fieldset className="land-ask-row land-ask-seats">
          <div className="land-ask-pick">
            {story.paths.map((path, i) => (
              <span key={path.value} className="land-ask-pick-item">
                {i > 0 ? <span className="land-ask-slash">/</span> : null}
                <button
                  type="button"
                  className="land-ask-opt"
                  data-on={seat === path.value ? "1" : undefined}
                  onClick={() => setSeat(path.value)}
                >
                  {path.label}
                </button>
              </span>
            ))}
          </div>
          <input type="hidden" name="seat" value={seat} />
        </fieldset>
        <label className="land-ask-row">
          <span className="land-ask-key">Name:</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="land-ask-row">
          <span className="land-ask-key">Email:</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="land-ask-row">
          <span className="land-ask-key">Entity:</span>
          <input name="company" required autoComplete="organization" />
        </label>
        {status === "error" ? <p className="land-ask-err">{message}</p> : null}
        <button type="submit" disabled={status === "submitting"} className="land-ask-row land-ask-go">
          <span className="land-ask-key">
            {status === "submitting" ? "Sending" : "Product Demonstration"}
            {status !== "submitting" ? (
              <span className="land-ask-go-mark" aria-hidden="true">
                <svg viewBox="0 0 12 12">
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : null}
          </span>
        </button>
      </form>
    );
  }

  const paperField = "w-full border-0 border-b border-rule bg-transparent py-2 outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <label className="grid gap-1">
        <span className="mono text-mute">Name</span>
        <input name="name" required autoComplete="name" className={paperField} />
      </label>
      <label className="grid gap-1">
        <span className="mono text-mute">Work email</span>
        <input name="email" type="email" required autoComplete="email" className={paperField} />
      </label>
      <label className="grid gap-1">
        <span className="mono text-mute">Company</span>
        <input name="company" required autoComplete="organization" className={paperField} />
      </label>
      <fieldset className="wait-path" aria-label="Seat">
        <div className="wait-path-row">
          {story.paths.map((path, i) => (
            <span key={path.value} className="wait-path-item">
              {i > 0 ? <span className="wait-path-slash">/</span> : null}
              <label>
                <input
                  type="radio"
                  name="seat"
                  value={path.value}
                  required
                  checked={seat === path.value}
                  onChange={() => setSeat(path.value)}
                />
                <span>{path.label}</span>
              </label>
            </span>
          ))}
        </div>
      </fieldset>
      {status === "error" ? <p className="mono">{message}</p> : null}
      <button type="submit" disabled={status === "submitting"} className="funnel-cta">
        {status === "submitting" ? "Sending" : "Product Demonstration"}
      </button>
    </form>
  );
}
