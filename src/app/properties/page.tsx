"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import propertiesData from "@/data/properties.json";
import type { Property, PropertyStatus } from "@/types/property";
import type { RVDMarketSnapshot } from "@/lib/rvd-data";
import PropertyCard from "@/components/PropertyCard";
import MarketDataBanner from "@/components/MarketDataBanner";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;

type Filter = "all" | PropertyStatus;
type Sort = "score" | "yield" | "district";

export default function PropertiesPage() {
  const [marketData, setMarketData] = useState<RVDMarketSnapshot | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("score");

  useEffect(() => {
    fetch("/api/market-snapshot")
      .then((r) => r.json())
      .then((data) => {
        setMarketData(data);
        setMarketLoading(false);
      })
      .catch(() => setMarketLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...PROPERTIES];
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    if (sort === "score") list.sort((a, b) => b.ai_score - a.ai_score);
    else if (sort === "yield") list.sort((a, b) => b.net_yield_pct - a.net_yield_pct);
    else list.sort((a, b) => a.district.localeCompare(b.district));
    return list;
  }, [filter, sort]);

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <MarketDataBanner data={marketData} loading={marketLoading} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1
          className="section-heading text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Our AI-Curated Portfolio
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          See why we chose each property
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="text-sm text-[var(--color-muted)]">Filter:</span>
          {(["all", "in_portfolio", "analyzing", "rejected"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-primary)] border border-[var(--color-border)]"
              }`}
            >
              {({ all: "All", in_portfolio: "In Portfolio", analyzing: "Analyzing", rejected: "Rejected" } as const)[f]}
            </button>
          ))}
          <span className="ml-4 text-sm text-[var(--color-muted)]">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
          >
            <option value="score">AI Score</option>
            <option value="yield">Yield</option>
            <option value="district">District</option>
          </select>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <PropertyCard property={p} />
            </li>
          ))}
        </ul>

        <div className="mt-12 w-full border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:px-6">
          <p className="mx-auto max-w-6xl text-center text-sm text-[var(--color-muted)]">
            These properties are owned by Tenantshield SPV — not by individual investors. Buying tokens means investing in the full portfolio.{" "}
            <Link href="/about" className="text-[var(--color-primary)] hover:underline">
              Why this model? →
            </Link>
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-center sm:px-6">
          <Link href="/invest" className="btn-primary inline-flex rounded-full px-6 py-3 text-sm">
            Buy Tenantshield Tokens →
          </Link>
        </div>
      </div>
    </div>
  );
}
