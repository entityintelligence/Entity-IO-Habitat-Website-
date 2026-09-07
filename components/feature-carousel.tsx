"use client";

import { story } from "@/content/copy";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function FeatureCarousel() {
  const [viewportRef, embla] = useEmblaCarousel({
    axis: "x",
    align: "center",
    loop: false,
    skipSnaps: false,
    containScroll: false,
    duration: 20,
  });
  const [on, setOn] = useState(0);

  const sync = useCallback(() => {
    if (!embla) return;
    setOn(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    sync();
    embla.on("select", sync);
    embla.on("reInit", sync);
    return () => {
      embla.off("select", sync);
      embla.off("reInit", sync);
    };
  }, [embla, sync]);

  return (
    <div className="feat-reel" ref={viewportRef}>
      <div className="feat-reel-track">
        {story.features.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`feat-slide${index === on ? " is-on" : ""}`}
            onClick={() => embla?.scrollTo(index)}
            aria-label={item.label}
            aria-current={index === on ? "true" : undefined}
          >
            <article className="feat-card">
              <div className="feat-card-body">
                <p className="feat-card-index">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="land-hero-live">{item.label}</h2>
                {(typeof item.line === "string" ? [item.line] : item.line).map((line) => (
                  <p key={line} className="feat-card-line">
                    {line}
                  </p>
                ))}
              </div>
            </article>
          </button>
        ))}
      </div>
    </div>
  );
}
