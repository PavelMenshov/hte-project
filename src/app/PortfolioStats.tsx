"use client";

import { useState, useEffect } from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useLiveCounter } from "@/lib/useCounter";

function randomInRange(min: number, max: number, decimals = 0) {
  const v = min + Math.random() * (max - min);
  return decimals === 0 ? Math.round(v) : parseFloat(v.toFixed(decimals));
}

function formatHKD(n: number) {
  return new Intl.NumberFormat("en-HK", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " HKD";
}

const UPDATE_INTERVAL_MS = 3000;

function useRandomTargets() {
  const [targets, setTargets] = useState(() => ({
    value: randomInRange(18_000_000, 35_000_000),
    properties: randomInRange(2, 7),
    score: randomInRange(7.0, 9.5, 1),
    investors: randomInRange(25, 75),
  }));

  useEffect(() => {
    const t = setInterval(() => {
      setTargets({
        value: randomInRange(18_000_000, 35_000_000),
        properties: randomInRange(2, 7),
        score: randomInRange(7.0, 9.5, 1),
        investors: randomInRange(25, 75),
      });
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return targets;
}

export default function PortfolioStats() {
  const [ref, isVisible] = useScrollReveal("visible", 0.15);
  const targets = useRandomTargets();
  const value = useLiveCounter(isVisible ? targets.value : 0, 1500, 0, isVisible);
  const properties = useLiveCounter(isVisible ? targets.properties : 0, 1200, 0, isVisible);
  const score = useLiveCounter(isVisible ? targets.score : 0, 1200, 1, isVisible);
  const investors = useLiveCounter(isVisible ? targets.investors : 0, 1200, 0, isVisible);

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-12" ref={ref as React.RefObject<HTMLElement>}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2
          className="section-heading mb-8 text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Live portfolio
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          <div className="text-center">
            <div className="counter-value text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
              {formatHKD(value)}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text)]">Portfolio value</div>
          </div>
          <div className="text-center">
            <div className="counter-value text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
              {Math.round(properties)}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text)]">Properties</div>
          </div>
          <div className="text-center">
            <div className="counter-value text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
              {score.toFixed(1)}/10
            </div>
            <div className="mt-1 text-sm text-[var(--color-text)]">Avg AI score</div>
          </div>
          <div className="text-center">
            <div className="counter-value text-2xl font-bold text-[var(--color-primary)] sm:text-3xl">
              {Math.round(investors)}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text)]">Investors</div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          Values update dynamically based on company-collected data.
        </p>
      </div>
    </section>
  );
}
