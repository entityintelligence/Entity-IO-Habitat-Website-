import { appendWaitlist, waitingCount } from "@/lib/wait-count";
import { NextResponse } from "next/server";

const SEATS = new Set(["design-partner", "waitlist"]);

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  seat?: string;
};

function valid(body: Payload) {
  const email = body.email?.trim() ?? "";
  return Boolean(
    body.name?.trim() &&
      email.includes("@") &&
      body.company?.trim() &&
      body.seat &&
      SEATS.has(body.seat),
  );
}

export async function GET() {
  return NextResponse.json({ waiting: await waitingCount() });
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!valid(body)) {
    return NextResponse.json({ error: "Please complete every field." }, { status: 400 });
  }

  const record = {
    ...body,
    receivedAt: new Date().toISOString(),
  };

  try {
    await appendWaitlist(record);
  } catch {
    // Count file is best-effort on read-only hosts.
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.WAITLIST_TO ?? "accounts@entityintelligence.io";

  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.WAITLIST_FROM ?? "KIT Waitlist <hello@entityintelligence.io>",
        to: [to],
        subject: `Seat: ${body.company} (${body.seat})`,
        text: Object.entries(record)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "Could not send email.", detail }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, waiting: await waitingCount() });
}
