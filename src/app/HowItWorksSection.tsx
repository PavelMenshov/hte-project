"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

const STEPS = [
  {
    num: 1,
    icon: "◈",
    title: "AI SCORES PROPERTIES",
    body: "AWS Bedrock agents analyse HK co-living properties by yield, location score, and projected occupancy rate.",
  },
  {
    num: 2,
    icon: "⬡",
    title: "SPV ACQUISITION",
    body: "TenantShield acquires the property through a Special Purpose Vehicle. Each SPV directly owns one asset — clean, legally isolated, SFC-structured.",
  },
  {
    num: 3,
    icon: "◆",
    title: "BUY TOKENS",
    body: "Purchase Real Estate Tokens from HKD 1,000. Each token is a fractional share of the SPV — secured on Abelian QDay, KYC-verified, ERC-3643 compliant.",
  },
  {
    num: 4,
    icon: "◉",
    title: "YOU EARN",
    body: "Receive 90% of net rental income quarterly, auto-distributed by smart contract. Exit via internal secondary market or quarterly redemption window.",
  },
];

export default function HowItWorksSection() {
  const [ref] = useScrollReveal("visible", 0.15);

  return (
    <section id="how-it-works" className="border-y border-[var(--border)] bg-[var(--surface)]/50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="section-heading mb-12 text-3xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}>
          How it works
        </h2>
        <ol
          ref={ref as React.RefObject<HTMLOListElement>}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-reveal"
        >
          {STEPS.map((step) => (
            <li key={step.num} className="card relative overflow-hidden p-6 stagger-item border-l-[3px] border-l-[var(--gold)]">
              <span
                className="absolute top-4 right-4 text-5xl font-normal opacity-30 text-[var(--gold)]"
                style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
                aria-hidden
              >
                {step.num}
              </span>
              <span className="text-xl text-[var(--gold)]" aria-hidden>{step.icon}</span>
              <h3
                className="mt-4 text-xs font-medium uppercase tracking-widest text-[var(--gold)]"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
