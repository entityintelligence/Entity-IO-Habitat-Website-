export function Mark({
  kind,
  className = "",
}: {
  kind: "terminal" | "ecosystem" | "module" | "resource" | "event" | "concierge";
  className?: string;
}) {
  const cls = `inline-block shrink-0 ${className}`;
  switch (kind) {
    case "terminal":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <path d="M1 6h10M6 1v10" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "ecosystem":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "module":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <rect x="2" y="2" width="8" height="8" fill="currentColor" opacity="0.18" />
          <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "resource":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "event":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <path d="M2 9 L6 3 L10 9" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "concierge":
      return (
        <svg viewBox="0 0 12 12" className={cls} aria-hidden>
          <circle cx="6" cy="6" r="2" fill="currentColor" />
        </svg>
      );
  }
}

export function ShowMark({
  kind,
  className = "",
}: {
  kind: "ingest" | "twin" | "guide" | "predict" | "automate";
  className?: string;
}) {
  if (kind === "ingest") {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <circle cx="52" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path d="M8 40h28" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path d="M24 28 L36 40 L24 52" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    );
  }
  if (kind === "twin") {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    );
  }
  if (kind === "guide") {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="40" cy="40" r="8" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "predict") {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <path d="M8 40h52" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path d="M48 26 L68 40 L48 54" fill="none" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <path d="M40 14a26 26 0 0 1 0 52" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M40 66a26 26 0 0 1 0-52" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}
