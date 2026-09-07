"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFieldPath } from "@/lib/lens";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlaceToggle } from "@/components/place";

export function SiteHeader() {
  const pathname = usePathname();
  const field = isFieldPath(pathname);
  if (pathname === "/") return null;

  return (
    <header className={`fixed top-0 z-30 ${field ? "split-head" : "site-head"}`}>
      <div className="head-bar">
        <Link href="/" className="head-brand">
          Kinetic Information Technology<span className="head-brand-slash">/</span>KIT
        </Link>
        <nav className="head-rail">
          <Link href="/habitat" className="head-link">
            Product
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <Link href="/join" className="head-link">
            Partnership Seats
          </Link>
          <span className="head-sep" aria-hidden="true" />
          <PlaceToggle />
          <span className="head-sep" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
