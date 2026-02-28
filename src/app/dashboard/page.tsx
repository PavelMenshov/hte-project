"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStoredTokenBalance } from "@/lib/user-tokens";
import portfolioData from "@/data/portfolio.json";
import type { Portfolio } from "@/types/property";
import PortfolioAdvisorChat from "@/components/PortfolioAdvisorChat";

const portfolio = portfolioData as Portfolio;

const MOCK_TOTAL_EARNED_BASE = 1840;
const MOCK_NEXT_PAYOUT_BASE = 312;

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tokensHeld, setTokensHeld] = useState(25);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) {
      router.replace("/login?from=/dashboard");
    }
  }, [mounted, router]);

  useEffect(() => {
    if (mounted) {
      const user = getSession();
      setTokensHeld(getStoredTokenBalance(user?.email));
    }
  }, [mounted]);

  if (!mounted) return null;

  const totalValue = tokensHeld * portfolio.token_nav_hkd;
  const sharePct = (tokensHeld / portfolio.total_tokens_outstanding) * 100;
  const totalEarned = Math.round(MOCK_TOTAL_EARNED_BASE * (tokensHeld / 25));
  const nextPayout = Math.round(MOCK_NEXT_PAYOUT_BASE * (tokensHeld / 25));

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1
          className="section-heading text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          My Tenantshield Portfolio
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Summary</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Tokens held</dt>
                <dd className="text-2xl font-bold text-[var(--color-primary)]">{tokensHeld}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Token price</dt>
                <dd className="text-2xl">HKD {portfolio.token_nav_hkd} <span className="text-sm text-[var(--color-success)]">(+{portfolio.token_nav_change_pct}% NAV)</span></dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Total value</dt>
                <dd className="text-2xl">HKD {totalValue.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Total earned</dt>
                <dd className="text-2xl text-[var(--color-success)]">HKD {totalEarned.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Next payout</dt>
                <dd className="text-xl">HKD {nextPayout} <span className="text-xs text-[var(--color-muted)]">(in 23 days)</span></dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              Your share of Tenantshield portfolio: {sharePct.toFixed(3)}%. Portfolio NAV: HKD {portfolio.total_aum_hkd.toLocaleString()} across {portfolio.active_properties} properties.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/invest" className="btn-primary rounded-full px-5 py-2 text-sm">
                Buy more tokens →
              </Link>
              <Link href="/properties" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                View portfolio →
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <PortfolioAdvisorChat
              portfolioContext={{
                tokensHeld,
                totalValueHkd: totalValue,
                totalEarnedHkd: totalEarned,
                nextPayoutHkd: nextPayout,
                navPerToken: portfolio.token_nav_hkd,
                yieldPct: portfolio.avg_portfolio_yield_pct,
                sharePct: sharePct,
              }}
            />
          </div>
        </div>

        <div className="card mt-8 overflow-x-auto p-6">
          <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">Payout history</h2>
          <table className="mt-4 w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted)]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text)]">
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Dec 2025</td>
                <td className="py-2">HKD 620</td>
                <td className="py-2">Quarterly payout</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Sep 2025</td>
                <td className="py-2">HKD 590</td>
                <td className="py-2">Quarterly payout</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Jun 2025</td>
                <td className="py-2">HKD 630</td>
                <td className="py-2">Quarterly payout</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
