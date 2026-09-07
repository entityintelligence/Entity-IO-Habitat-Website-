"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QUESTIONS } from "@/lib/questions";
import { replyTo, type KitReply, type Posture } from "@/lib/kit-reply";
import type { HabitatPart } from "@/lib/habitat";
import type { HabitatView } from "@/lib/layers";
import type { Lens } from "@/lib/lens";
import type { Session } from "@/lib/sessions";
import { MATURITY, MATURITY_NOW, type MaturityLevel } from "@/lib/maturity";
import { exceptions } from "@/lib/hold";
import type { EcoInner, Ecosystem } from "@/lib/ecosystems";
import type { Granule, SliceBrief } from "@/lib/slices";
import { WaitlistForm } from "@/components/waitlist-form";
import { story } from "@/content/copy";

const POSTURES: { id: Posture; label: string }[] = [
  { id: "attention", label: "KIT" },
  { id: "progressive", label: "KIT · progressive" },
  { id: "conservative", label: "KIT · conservative" },
];

const COMMS_PROMPTS = QUESTIONS.filter((item) => item.id !== 10).map((item) => item.q);
const COMMS_STARTS = [
  "What needs my attention today?",
  "Where are we currently constrained?",
  "What decisions are waiting to be made?",
];

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeech(): SpeechRec | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = "en-AU";
  return rec;
}

export function Comms({
  session,
  onReply,
  lens = "habitat",
  view = "ecosystems",
  part = null,
  brief = null,
  granule = null,
  eco = null,
  ecoInner = null,
  maturity = null,
}: {
  session: Session | null;
  onReply: (reply: KitReply) => void;
  lens?: Lens;
  view?: HabitatView;
  part?: HabitatPart | null;
  brief?: SliceBrief | null;
  granule?: Granule | null;
  eco?: Ecosystem | null;
  ecoInner?: EcoInner | null;
  maturity?: MaturityLevel | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const [draft, setDraft] = useState("");
  const [posture, setPosture] = useState<Posture>("attention");
  const [modes, setModes] = useState(false);
  const [plus, setPlus] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [voiceOk, setVoiceOk] = useState(true);

  useEffect(() => {
    setVoiceOk("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }, []);

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  const send = (text = draft) => {
    const q = text.trim();
    if (!q || busy) return;
    setPlus(false);
    setModes(false);
    setBusy(true);
    setStatus("reading the habitat");
    window.setTimeout(() => {
      const reply = replyTo(q, posture);
      setBusy(false);
      setDraft("");
      setStatus("");
      setAnswer(reply.session ? "" : reply.text);
      onReply(reply);
    }, 420);
  };

  const listen = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      setStatus("");
      return;
    }
    const rec = getSpeech();
    if (!rec) {
      setStatus("voice isn’t available here");
      return;
    }
    recRef.current = rec;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      if (said) {
        setDraft(said);
        send(said);
      }
    };
    rec.onend = () => {
      setListening(false);
      if (!busy) setStatus("");
    };
    rec.onerror = () => {
      setListening(false);
      setStatus("");
    };
    rec.start();
    setListening(true);
    setStatus("listening");
  };

  if (lens === "join") {
    return (
      <div className="comms">
        <div className="comms-thread">
          <div className="funnel">
            <p className="funnel-kicker mono">KIT</p>
            <h1 className="funnel-title">Request a seat</h1>
            <p className="funnel-lede">{story.ask}</p>
          </div>
          <WaitlistForm tone="field" />
          <p className="mono mt-8 text-mute">
            hello@entityintelligence.io
            <br />
            accounts@entityintelligence.io
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="comms">
      <div className="comms-thread">
        {status ? <p className="comms-chip self-center">{status}</p> : null}

        {!status && !session && !answer && !part && !brief && !eco && maturity == null ? (
          <div className="funnel">
            <p className="funnel-kicker mono">KIT</p>
            <h1 className="funnel-title">This is the Habitat.</h1>
            <p className="funnel-lede">
              Choose a part of the body. The mark becomes that form. Press a mass to read it. Or ask what needs your
              attention.
            </p>
            <div className="funnel-starts">
              {COMMS_STARTS.map((q) => (
                <button key={q} type="button" className="funnel-ask" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
            <Link href="/?lens=join" scroll={false} className="funnel-cta">
              Partnership Seats
            </Link>
          </div>
        ) : null}

        {maturity != null && !session ? (
          <article className="comms-answer is-dossier" aria-live="polite">
            <div className="comms-head">
              <p className="mono">0{maturity}</p>
              <p className="mono">{MATURITY[maturity - 1].label}</p>
              <p className="mono">KIT</p>
            </div>
            <div className="health-row">
              <span className={`health-pill ${maturity <= MATURITY_NOW ? "is-stable" : "is-watch"}`}>
                {maturity <= MATURITY_NOW ? "occupied" : "next threshold"}
              </span>
              <span className="mono">
                {maturity === MATURITY_NOW + 1 ? "the step KIT is built to take" : `level ${maturity} of 6`}
              </span>
            </div>
            <p className="comms-body">
              {MATURITY[maturity - 1].verb} {MATURITY[maturity - 1].body}
            </p>
            <ul className="comms-acts">
              {MATURITY.map((item) => (
                <li key={item.level} className={item.level === maturity ? "is-on" : ""}>
                  <span className="mono who">[{item.level}]</span>
                  <span>
                    {item.label}
                    {item.level === MATURITY_NOW ? " — you are here" : ""}
                    {item.level === MATURITY_NOW + 1 ? " — next" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {eco && !session && !brief && maturity == null ? (
          <article className="comms-answer is-dossier" aria-live="polite">
            <div className="comms-head">
              <p className="mono">ECO {eco.stamp}</p>
              <p className="mono">{ecoInner?.title ?? eco.label}</p>
              <p className="mono">KIT</p>
            </div>
            <div className="health-row">
              <span className={`health-pill is-${ecoInner?.health ?? eco.health}`}>
                {ecoInner?.health ?? eco.health}
              </span>
              {ecoInner ? null : <span className="mono">{eco.state}</span>}
            </div>
            <p className="comms-body">{ecoInner?.note ?? eco.body}</p>
            {exceptions(eco.inners).length ? (
              <ul className="comms-acts">
                {exceptions(eco.inners).map((item) => (
                  <li key={item.id} className={ecoInner?.id === item.id ? "is-on" : ""}>
                    <span className={`mono who health-dot is-${item.health}`}>[{item.health}]</span>
                    <span>
                      {item.title} — {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ) : null}

        {brief && !session && maturity == null ? (
          <article className="comms-answer is-dossier" aria-live="polite">
            <div className="comms-head">
              <p className="mono">{brief.code}</p>
              <p className="mono">{granule?.title ?? brief.title}</p>
              <p className="mono">KIT</p>
            </div>
            <div className="health-row">
              <span className={`health-pill is-${granule?.health ?? brief.health}`}>
                {granule?.health ?? brief.health}
              </span>
              {granule ? null : <span className="mono">{brief.state}</span>}
            </div>
            <p className="comms-body">{granule?.note ?? brief.body}</p>
            {exceptions(brief.granules).length ? (
              <ul className="comms-acts">
                {exceptions(brief.granules).map((item) => (
                  <li key={item.id} className={granule?.id === item.id ? "is-on" : ""}>
                    <span className={`mono who health-dot is-${item.health}`}>[{item.health}]</span>
                    <span>
                      {item.title} — {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ) : null}

        {part && !session && !brief && !eco && maturity == null ? (
          <article className="comms-answer is-dossier" aria-live="polite">
            <div className="comms-head">
              <p className="mono">{part.code}</p>
              <p className="mono">{part.title}</p>
              <p className="mono">KIT</p>
            </div>
            <p className="mono comms-tags">[{part.layer}] [{part.state.toLowerCase()}]</p>
            <p className="comms-body">{part.body}</p>
            <ul className="comms-acts">
              {part.inner.map((line) => (
                <li key={line}>
                  <span className="mono who">[module]</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {session ? (
          <article className="comms-answer is-dossier" aria-live="polite">
            <div className="comms-head">
              <p className="mono">Habitat</p>
              <p className="mono">{session.title}</p>
              <p className="mono">KIT</p>
            </div>
            <p className="mono comms-tags">{session.tags.map((t) => `[${t}]`).join(" ")}</p>
            <p className="comms-body">{session.body}</p>
            <ul className="comms-acts">
              {session.acts.map((d) => (
                <li key={d.who}>
                  <span className="mono who">[{d.who}]</span>
                  <span>{d.line}</span>
                </li>
              ))}
            </ul>
          </article>
        ) : answer ? (
          <div className="comms-answer" role="status">
            <p>{answer}</p>
          </div>
        ) : null}

        {(session || answer || part || brief || eco || maturity != null) && !status ? (
          <Link href="/?lens=join" scroll={false} className="funnel-cta">
            Partnership Seats
          </Link>
        ) : null}
      </div>

      <form
        className="comms-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="relative">
          <button
            type="button"
            className="comms-plus"
            aria-label="Add a question"
            aria-expanded={plus}
            onClick={() => {
              setPlus((v) => !v);
              setModes(false);
            }}
          >
            <span aria-hidden>+</span>
          </button>
          {plus ? (
            <div className="comms-menu left-0">
              {COMMS_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="comms-menu-item"
                  onClick={() => {
                    setDraft(p);
                    setPlus(false);
                    send(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <input
          ref={inputRef}
          className="comms-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask, or speak"
          aria-label="Ask KIT"
          autoComplete="off"
          disabled={busy}
        />

        <div className="relative shrink-0">
          <button
            type="button"
            className="comms-mode"
            aria-haspopup="listbox"
            aria-expanded={modes}
            onClick={() => {
              setModes((v) => !v);
              setPlus(false);
            }}
          >
            {POSTURES.find((p) => p.id === posture)?.label}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          {modes ? (
            <div className="comms-menu right-0" role="listbox">
              {POSTURES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={p.id === posture}
                  className="comms-menu-item"
                  onClick={() => {
                    setPosture(p.id);
                    setModes(false);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className={`comms-mic ${listening ? "is-live" : ""}`}
          aria-label={listening ? "Stop listening" : voiceOk ? "Speak" : "Voice not available"}
          onClick={listen}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <rect x="6" y="2" width="4" height="7" rx="2" fill="currentColor" />
            <path
              d="M4 7.5a4 4 0 0 0 8 0M8 11.5v2.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
