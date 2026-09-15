import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy — Entity io" };

export default function PrivacyPage() {
  return (
    <article className="page inner pb-8">
      <h1 className="display text-4xl">Privacy Policy</h1>
      <p className="measure mt-8 text-[17px] leading-[1.55]">
        Submissions are used only to evaluate founding-pilot fit and to contact you. We do not sell this information.
        Write to hello@entityintelligence.io to remove a record.
      </p>
    </article>
  );
}
