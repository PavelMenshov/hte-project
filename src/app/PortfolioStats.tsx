"use client";

import { useState, useEffect, useRef } from "react";
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

type StatBlockProps = {
  value: React.ReactNode;
  label: string;
  pop: boolean;
};

function StatBlock({ value, label, pop }: StatBlockProps) {
  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 text-center sm:text-left">
      <span
        className={`text-4xl font-normal text-[var(--gold-bright)] ${pop ? "counter-pop" : ""}`}
        style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
      >
        {value}
      </span>
      <span
        className="text-xs uppercase tracking-widest text-[var(--text-2)]"
        style={{ fontFamily: "var(--font-dm-mono), monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function PortfolioStats() {
  const [ref, isVisible] = useScrollReveal("visible", 0.15);
  const targets = useRandomTargets();
  const value = useLiveCounter(isVisible ? targets.value : 0, 1500, 0, isVisible);
  const properties = useLiveCounter(isVisible ? targets.properties : 0, 1200, 0, isVisible);
  const score = useLiveCounter(isVisible ? targets.score : 0, 1200, 1, isVisible);
  const investors = useLiveCounter(isVisible ? targets.investors : 0, 1200, 0, isVisible);

  const [pop, setPop] = useState(false);
  const prevValues = useRef({ value: 0, properties: 0, score: 0, investors: 0 });

  useEffect(() => {
    const changed =
      value !== prevValues.current.value ||
      properties !== prevValues.current.properties ||
      score !== prevValues.current.score ||
      investors !== prevValues.current.investors;
    if (changed && isVisible) {
      prevValues.current = { value, properties, score, investors };
      setPop(true);
      const t = setTimeout(() => setPop(false), 300);
      return () => clearTimeout(t);
    }
  }, [value, properties, score, investors, isVisible]);

  const stats = [
    { value: formatHKD(value), label: "Portfolio value" },
    { value: Math.round(properties), label: "Properties" },
    { value: `${score.toFixed(1)}/10`, label: "Avg AI score" },
    { value: Math.round(investors), label: "Investors" },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="border-y border-[var(--border)] bg-[var(--bg-2)] py-12 border-t-[1px] border-t-[var(--gold)]"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-0">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex justify-center sm:flex-1 ${i < 3 ? "sm:border-r sm:border-[var(--gold)]/40 sm:pr-8" : "sm:pl-8"}`}>
              <StatBlock value={s.value} label={s.label} pop={pop} />
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-[var(--text-3)]" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
          Platform data · Updated in real-time
        </p>
      </div>
    </section>
  );
}
