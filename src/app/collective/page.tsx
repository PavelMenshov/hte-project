"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Building2, Calculator, Calendar, TrendingUp } from "lucide-react";

const PORTFOLIO = {
  total_tokens: 26_000,
  token_price_hkd: 1_073,
  monthly_gross_income: 100_000,
  spv_fee_pct: 0.1,
  investor_share_pct: 0.9,
  properties: [
    { name: "Sha Tin New Town Floor", rooms: 8, rent_per_room: 7_250 },
    { name: "Sai Kung Residence Block A", rooms: 6, rent_per_room: 7_000 },
  ],
};

const TOKENS_MIN = 1;
const TOKENS_MAX = 500;
const TOKENS_DEFAULT = 25;

export default function CollectivePage() {
  const [tokens, setTokens] = useState(TOKENS_DEFAULT);

  const monthlyDistributed = PORTFOLIO.monthly_gross_income * PORTFOLIO.investor_share_pct;
  const yourMonthly = (monthlyDistributed * tokens) / PORTFOLIO.total_tokens;
  const yourQuarterly = yourMonthly * 3;
  const yourAnnual = yourMonthly * 12;
  const yourInvestmentHkd = tokens * PORTFOLIO.token_price_hkd;
  const yieldPct = yourInvestmentHkd > 0 ? (yourAnnual / yourInvestmentHkd) * 100 : 0;
  const sharePct = (tokens / PORTFOLIO.total_tokens) * 100;

  const formatHKD = (n: number) =>
    "HKD " + n.toLocaleString("en-HK", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Block 1: Hero */}
        <section className="text-center">
          <h1
            className="section-heading text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Why 100 Co-owners Can&apos;t Run an Apartment
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">
            The collective ownership problem — and how Tenantshield solves it.
          </p>
        </section>

        {/* Block 2: Two columns comparison */}
        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="card border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6">
            <h2 className="text-lg font-bold text-[var(--color-danger)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              ❌ Collective Ownership (Broken)
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>• 100 anonymous co-owners</li>
              <li>• Who signs the lease? Nobody agrees.</li>
              <li>• Tenant damages the flat — 100 people vote on repairs</li>
              <li>• One owner wants to sell — blocks everyone</li>
              <li>• Legally: joint liability nightmare</li>
              <li className="font-medium text-[var(--color-danger)]">Result: No tenant will rent from 100 strangers</li>
            </ul>
          </div>
          <div className="card border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-6">
            <h2 className="text-lg font-bold text-[var(--color-success)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              ✅ Tenantshield Model (How we do it)
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>• Tenantshield SPV is the single legal owner</li>
              <li>• SPV signs leases, manages repairs, makes decisions</li>
              <li>• You own tokens = a share of the company</li>
              <li>• Same structure as an ETF or REIT</li>
              <li className="font-medium text-[var(--color-success)]">Result: Professional management, you just earn</li>
            </ul>
          </div>
        </section>

        {/* Block 3: Income distribution simulation */}
        <section className="card mt-16 p-6 sm:p-8">
          <h2
            className="section-heading text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            How income is distributed
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-[var(--color-text)]">
                <span>Your tokens</span>
                <span className="font-mono text-[var(--color-primary)]">{tokens}</span>
              </label>
              <input
                type="range"
                min={TOKENS_MIN}
                max={TOKENS_MAX}
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                className="mt-2 h-2 w-full appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-primary)]"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--color-muted)]">Total tokens outstanding</span>
              <p className="mt-1 font-mono text-[var(--color-text)]">{PORTFOLIO.total_tokens.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-[var(--color-bg)]/60 p-4" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            <p className="text-sm text-[var(--color-muted)]">Your share: <span className="font-semibold text-[var(--color-primary)]">{sharePct.toFixed(2)}%</span></p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Monthly rental income (whole portfolio): {formatHKD(PORTFOLIO.monthly_gross_income)}</p>
            <p className="mt-1 text-white">Your monthly share: <span className="text-[var(--color-primary)]">{formatHKD(yourMonthly)}</span></p>
            <p className="mt-1 text-white">Your quarterly payout: <span className="text-[var(--color-primary)]">{formatHKD(yourQuarterly)}</span></p>
            <p className="mt-1 text-white">Your annual income: <span className="text-[var(--color-primary)]">{formatHKD(yourAnnual)}</span></p>
            <p className="mt-2 text-sm text-[var(--color-success)]">Annual yield on investment: {yieldPct.toFixed(1)}% (at {formatHKD(PORTFOLIO.token_price_hkd)} per token)</p>
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Where HKD 100,000 comes from</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              <li>• 2 active properties</li>
              <li>• Sha Tin (8 rooms × {formatHKD(7250)}): {formatHKD(8 * 7250)}/mo gross</li>
              <li>• Sai Kung (6 rooms × {formatHKD(7000)}): {formatHKD(6 * 7000)}/mo gross</li>
              <li>• Total gross: {formatHKD(PORTFOLIO.monthly_gross_income)}</li>
              <li>• SPV keeps 10%: {formatHKD(PORTFOLIO.monthly_gross_income * PORTFOLIO.spv_fee_pct)}</li>
              <li className="text-[var(--color-primary)]">• Distributed to token holders: {formatHKD(monthlyDistributed)}</li>
            </ul>
          </div>
        </section>

        {/* Block 4: Timeline */}
        <section className="mt-16">
          <h2
            className="section-heading text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            How money reaches you
          </h2>
          <div className="mt-8 space-y-0">
            {[
              { icon: Home, title: "Tenant pays rent (1st of month)", desc: "Student pays HKD 7,250 for their room in Sha Tin co-living" },
              { icon: Building2, title: "SPV receives full payment", desc: "Tenantshield SPV collects from all rooms across portfolio" },
              { icon: Calculator, title: "Smart contract calculates shares", desc: "RevenueDistributor.sol splits 90% proportionally to all token holders" },
              { icon: Calendar, title: "Quarterly distribution", desc: "Every 3 months: claim USDT to wallet or auto-reinvest into more tokens" },
              { icon: TrendingUp, title: "Token NAV grows", desc: "As portfolio properties appreciate, each token is worth more" },
            ].map((step, idx) => (
              <div key={step.title} className="flex gap-4 transition-opacity duration-300 hover:opacity-100 sm:opacity-95">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  {idx < 4 && <div className="mt-1 h-full w-0.5 flex-1 bg-[var(--color-border)]" />}
                </div>
                <div className="pb-10">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-[var(--color-muted)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Block 5: Three cards */}
        <section className="mt-16">
          <h2
            className="section-heading text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Why this beats renting alone
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="card border-[var(--color-border)] p-5">
              <h3 className="font-bold text-[var(--color-muted)]">Renting alone</h3>
              <p className="mt-2 text-sm text-[var(--color-text)]">You pay: {formatHKD(12_000)}/month</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">You own: Nothing</p>
              <p className="mt-3 text-xs text-[var(--color-danger)]">After 5 years: HKD 0 left</p>
            </div>
            <div className="card border-[var(--color-primary)]/20 p-5">
              <h3 className="font-bold text-[var(--color-primary)]">Tenantshield co-living room</h3>
              <p className="mt-2 text-sm text-[var(--color-text)]">You pay: {formatHKD(7_250)}/month (as tenant)</p>
              <p className="mt-1 text-sm text-[var(--color-success)]">Save vs market: {formatHKD(4_750)}/mo</p>
              <p className="mt-3 text-xs text-[var(--color-muted)]">After 5 years: Still HKD 0, but saved {formatHKD(285_000)}</p>
            </div>
            <div className="card border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-5">
              <h3 className="font-bold text-[var(--color-success)]">Tenantshield tokens (HKD 10,000 invested)</h3>
              <p className="mt-2 text-sm text-[var(--color-text)]">You invest once: {formatHKD(10_000)}</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">You earn: {formatHKD(830)}/year</p>
              <p className="mt-3 text-xs font-medium text-[var(--color-success)]">After 5 years: HKD 15,100 (+51%)</p>
              <p className="mt-2 text-xs font-semibold text-[var(--color-primary)]">Best of both worlds: rent a room + invest tokens with savings</p>
            </div>
          </div>
        </section>

        {/* Block 6: CTA */}
        <section className="card mt-16 border-[var(--color-primary)]/30 p-8 text-center">
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Ready to be on the receiving end of rent?
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">Stop paying rent. Start earning it.</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Buy Tenantshield tokens from HKD 1,000.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/invest" className="btn-primary inline-flex rounded-full px-8 py-3 text-sm">
              Buy Tokens →
            </Link>
            <Link
              href="/properties"
              className="inline-flex rounded-full border-2 border-[var(--color-border)] bg-transparent px-8 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              See Portfolio →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
