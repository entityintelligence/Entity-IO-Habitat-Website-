"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlaceToggle } from "@/components/place";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/product") return null;

  return (
    <header className="fixed top-0 z-30 site-head">
      <div className="head-bar">
        <Link href="/" className="head-brand">
          Kinetic Information Technology<span className="head-brand-slash">/</span>KIT
        </Link>
        <nav className="head-rail">
          <Link href="/product" className="head-link">
            Explore Habitat 1: Genesis
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <Link href="/?enroll=1" className="head-link">
            Pilot Product
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <PlaceToggle />
        </nav>
      </div>
    </header>
  );
}
