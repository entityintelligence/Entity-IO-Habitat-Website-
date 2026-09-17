import { appendWaitlist, waitingCount } from "@/lib/wait-count";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEATS = new Set(["design-partner", "waitlist"]);
const INBOX = "hello@entityintelligence.io";

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  seat?: string;
};

function readEnv(name: string) {
  const value = process.env[name];
  if (!value || value === "[SENSITIVE]") return "";
  return value.trim();
}

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

function fromAddresses() {
  const listed = [readEnv("WAITLIST_FROM"), `Entity Intelligence <${INBOX}>`, "Entity Intelligence <onboarding@resend.dev>"];
  return listed.filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}

async function sendEnquiry(record: {
  name?: string;
  email?: string;
  company?: string;
  seat?: string;
  receivedAt: string;
}) {
  const key = readEnv("RESEND_API_KEY");
  if (!key) {
    throw new Error("Mail is not configured.");
  }

  const to = readEnv("WAITLIST_TO") || INBOX;
  const text = [
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Entity: ${record.company}`,
    `Seat: ${record.seat}`,
    `Received: ${record.receivedAt}`,
  ].join("\n");
  let last = "Could not send email.";

  for (const from of fromAddresses()) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: record.email,
        subject: `Enquiry: ${record.company} (${record.seat})`,
        text,
      }),
    });
    const body = await res.text();
    if (res.ok) return;
    last = body.slice(0, 400) || last;
    console.error("waitlist mail failed", res.status, from.split("<").pop() ?? from, last);
  }

  throw new Error(last);
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
    name: body.name?.trim(),
    email: body.email?.trim(),
    company: body.company?.trim(),
    seat: body.seat,
    receivedAt: new Date().toISOString(),
  };

  try {
    await appendWaitlist(record);
  } catch {
    // Count file is best-effort on read-only hosts.
  }

  try {
    await sendEnquiry(record);
  } catch (error) {
    console.error("waitlist mail error", error instanceof Error ? error.message : error, {
      hasResend: Boolean(readEnv("RESEND_API_KEY")),
      mailKeys: Object.keys(process.env).filter((key) => key.startsWith("RESEND") || key.startsWith("WAITLIST")),
    });
    return NextResponse.json({ error: "Could not send. Write to hello@entityintelligence.io." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, waiting: await waitingCount() });
}
