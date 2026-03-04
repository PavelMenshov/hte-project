"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

export default function HowItWorksSection() {
  const [ref] = useScrollReveal("visible", 0.15);

  return (
    <section id="how-it-works" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 animate-fade-in-down-delay-1">
        <h2
          className="section-heading mb-12 text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          How it works
        </h2>
        <ol
          ref={ref as React.RefObject<HTMLOListElement>}
          className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 stagger-reveal"
        >
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>1</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>AI Scores Properties</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Our Bedrock AI analyses HK co-living properties by yield, location, and occupancy rate.
            </p>
          </li>
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>2</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>We Acquire</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              TenantShield purchases the property via an SPV (Special Purpose Vehicle) structure.
            </p>
          </li>
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>3</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>You Buy Tokens</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Purchase Real Estate Tokens from HKD 1,000. Each token = a fractional share of the SPV.
            </p>
          </li>
          <li className="card p-6 stagger-item">
            <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>4</span>
            <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>You Earn</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Receive 90% of net rental income quarterly, directly to your wallet.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
