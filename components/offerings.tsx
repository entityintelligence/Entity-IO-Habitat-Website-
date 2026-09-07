import Link from "next/link";
import { offerings } from "@/content/copy";

export function Offerings() {
  return (
    <section id="offerings" className="offer">
      <div className="offer-story">
        <p className="offer-kicker">{offerings.kicker}</p>
        <h2 className="offer-title">
          {offerings.line}
          <span>{offerings.line2}</span>
        </h2>
        <p className="offer-lede">{offerings.lede}</p>
        <ul className="offer-points">
          {offerings.points.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              {item.body}
            </li>
          ))}
        </ul>
        <Link href="/join" className="offer-cta">
          Partnership Seats
        </Link>
        <p className="offer-who">{offerings.who}</p>
      </div>
    </section>
  );
}
