"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/product") return null;

  return (
    <footer className="page flex flex-wrap items-end justify-between gap-6 pb-10 pt-16">
      <p className="mono text-mute">KIT</p>
      <div className="flex gap-8">
        <Link href="/?enroll=1" className="mono text-mute">
          Pilot Product
        </Link>
        <Link href="/privacy" className="mono text-mute">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
