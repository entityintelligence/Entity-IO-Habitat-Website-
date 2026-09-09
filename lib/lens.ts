export type Lens = "habitat" | "join";

export const LENSES: { id: Lens; href: string; label: string; hint: string }[] = [
  { id: "habitat", href: "/habitat", label: "Product", hint: "see the body" },
  { id: "join", href: "/join", label: "Partnership Seats", hint: "partnership seats" },
];

export function lensFromSearch(value: string | null): Lens | null {
  if (value === "join") return "join";
  if (value === "habitat") return "habitat";
  return null;
}

export function lensFromPath(pathname: string): Lens | null {
  if (pathname === "/join") return "join";
  if (pathname === "/habitat") return "habitat";
  return null;
}

export function isFieldPath(pathname: string) {
  return pathname === "/" || pathname === "/habitat" || pathname === "/join" || pathname === "/product";
}
