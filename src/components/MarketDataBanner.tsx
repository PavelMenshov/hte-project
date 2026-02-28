"use client";

import type { RVDMarketSnapshot } from "@/lib/rvd-data";

export interface MarketDataBannerProps {
  data: RVDMarketSnapshot | null;
  loading: boolean;
}

export default function MarketDataBanner({ data, loading }: MarketDataBannerProps) {
  if (loading) {
    return (
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-stretch gap-6">
            <div className="h-16 w-48 animate-pulse rounded-lg bg-[var(--color-border)]/50" />
            <div className="h-16 w-32 animate-pulse rounded-lg bg-[var(--color-border)]/50" />
            <div className="h-16 w-28 animate-pulse rounded-lg bg-[var(--color-border)]/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const latest = data.recentTransactions[0];
  const trendColor =
    data.marketTrend === "rising"
      ? "var(--color-success)"
      : data.marketTrend === "cooling"
        ? "var(--color-danger)"
        : "var(--color-warning)";
  const trendArrow = data.marketTrend === "rising" ? "↑" : data.marketTrend === "cooling" ? "↓" : "→";

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          📊 LIVE HK MARKET DATA &nbsp;•&nbsp; Source: Rating &amp; Valuation Dept
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[var(--color-muted)]">
              {latest?.month ?? "—"} Transactions
            </p>
            <p className="mt-0.5 font-bold text-white" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              {latest?.totalSales.toLocaleString() ?? "—"} deals
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              HK${((latest?.totalValue ?? 0) / 1000).toFixed(1)}B total value
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)]">Market Trend</p>
            <p className="mt-0.5 font-bold" style={{ color: trendColor, fontFamily: "var(--font-ibm-plex-mono)" }}>
              {trendArrow} {data.trendPercent > 0 ? "+" : ""}{data.trendPercent}%
            </p>
            <p className="text-sm text-[var(--color-muted)]">vs prev quarter</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)]">YTD Volume</p>
            <p className="mt-0.5 font-bold text-white" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              HK${data.yearlyStats.totalValueBillionHKD}B
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {data.yearlyStats.year} • {data.yearlyStats.totalTransactions.toLocaleString()} transactions
            </p>
          </div>
        </div>
        {latest && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            <span className="text-[var(--color-muted)]">Primary: {latest.primarySales.toLocaleString()}</span>
            <span className="text-[var(--color-border)]">│</span>
            <span className="text-[var(--color-muted)]">Secondary: {latest.secondarySales.toLocaleString()}</span>
          </div>
        )}
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Data from Hong Kong Rating &amp; Valuation Department • Updated monthly • This data reflects territory-wide market conditions
        </p>
      </div>
    </div>
  );
}
