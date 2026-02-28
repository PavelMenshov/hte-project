"use client";

import { useMemo, useState } from "react";
import portfolioData from "@/data/portfolio.json";
import type { Portfolio } from "@/types/property";

const portfolio = portfolioData as Portfolio;

const MIN_HKD = 1000;
const MAX_HKD = 100000;
const INVESTOR_SHARE = 0.9;

type Props = {
  onSimulate?: (amountHkd: number, payoutType: "quarterly" | "reinvest") => void;
};

export default function InvestmentCalculator({ onSimulate }: Props) {
  const [amount, setAmount] = useState(10000);
  const [payoutType, setPayoutType] = useState<"quarterly" | "reinvest">("quarterly");

  const tokens = Math.floor(amount / portfolio.token_nav_hkd);
  const sharePct = (tokens / portfolio.total_tokens_outstanding) * 100;
  const annualIncome = (amount * (portfolio.avg_portfolio_yield_pct / 100)) * INVESTOR_SHARE;
  const quarterlyIncome = annualIncome / 4;
  const projected5y = amount * Math.pow(1 + (portfolio.avg_portfolio_yield_pct / 100) * INVESTOR_SHARE, 5);

  return (
    <div className="card p-6">
      <h3
        className="font-bold text-white"
        style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
      >
        Invest in the portfolio — not in one property
      </h3>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-muted)]">Tenantshield Token Price</span>
          <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>HKD {portfolio.token_nav_hkd.toLocaleString()} (current NAV)</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-[var(--color-muted)]">Minimum</span>
          <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>HKD 1,000 (1 token)</span>
        </div>
      </div>
      <div className="mt-6">
        <label className="text-sm text-[var(--color-muted)]">Amount (HKD)</label>
        <input
          type="range"
          min={MIN_HKD}
          max={MAX_HKD}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--color-primary)]"
        />
        <div className="mt-2 flex justify-between text-sm">
          <span style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>HKD {amount.toLocaleString()}</span>
          <span className="text-[var(--color-muted)]">Tokens: {tokens}</span>
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-lg bg-[var(--color-bg)]/50 p-4 text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Your portfolio share</span>
          <span>{sharePct.toFixed(3)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Estimated annual income (8.3% yield × 90%)</span>
          <span className="text-[var(--color-primary)]">HKD {Math.round(annualIncome).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted)]">Projected value in 5 years</span>
          <span>HKD {Math.round(projected5y).toLocaleString()} (+{(((projected5y - amount) / amount) * 100).toFixed(0)}%)</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-sm text-[var(--color-muted)]">Payout preference</span>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payout"
              checked={payoutType === "quarterly"}
              onChange={() => setPayoutType("quarterly")}
              className="accent-[var(--color-primary)]"
            />
            <span className="text-sm">Quarterly to wallet (USDT/HKD)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payout"
              checked={payoutType === "reinvest"}
              onChange={() => setPayoutType("reinvest")}
              className="accent-[var(--color-primary)]"
            />
            <span className="text-sm">Auto-reinvest (compound)</span>
          </label>
        </div>
      </div>
      {onSimulate && (
        <button
          type="button"
          onClick={() => onSimulate(amount, payoutType)}
          className="btn-primary mt-6 w-full rounded-full py-3 text-sm"
        >
          🎮 Simulate Investment — Demo Mode
        </button>
      )}
    </div>
  );
}
