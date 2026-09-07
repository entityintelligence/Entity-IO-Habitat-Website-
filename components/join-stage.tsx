"use client";

import Link from "next/link";
import { story } from "@/content/copy";
import { WaitlistForm } from "@/components/waitlist-form";

export function JoinStage() {
  return (
    <div className="join">
      <section className="join-ask">
        <p className="mono join-kicker">KIT</p>
        <h1 className="join-title">Request a seat</h1>
        <p className="join-lede">{story.ask}</p>
        <WaitlistForm tone="field" />
        <p className="mono join-mail">
          hello@entityintelligence.io
          <br />
          accounts@entityintelligence.io
        </p>
        <p className="join-foot">
          <Link href="/" className="mono">
            Back
          </Link>
          <Link href="/habitat" className="mono">
            Product
          </Link>
          <Link href="/privacy" className="mono">
            Privacy
          </Link>
        </p>
      </section>
    </div>
  );
}
