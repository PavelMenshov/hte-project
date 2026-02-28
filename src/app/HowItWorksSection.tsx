"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

export default function HowItWorksSection() {
  const [ref] = useScrollReveal("visible", 0.15);

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 animate-fade-in-down-delay-1">
        <h2
          className="section-heading mb-12 text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          How it works
        </h2>
        <ol
          ref={ref as React.RefObject<HTMLOListElement>}
          className="grid gap-10 md:grid-cols-3 stagger-reveal"
        >
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>1</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>AI SCANS THE MARKET</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              AWS Bedrock agents analyze HK properties and score each one for yield, growth potential, and co-living fit.
            </p>
          </li>
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>2</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>WE BUY THE BEST</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Tenantshield acquires AI-selected properties as co-living spaces for students.
            </p>
          </li>
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>3</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>YOU EARN</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Buy Tenantshield tokens from HKD 1,000. Get 90% of net income. Token grows with portfolio NAV.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
