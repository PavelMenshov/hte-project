"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import propertiesData from "@/data/properties.json";
import type { Property, PropertyStatus } from "@/types/property";
import type { RVDMarketSnapshot } from "@/lib/rvd-data";
import PropertyCard from "@/components/PropertyCard";
import MarketDataBanner from "@/components/MarketDataBanner";
import { useScrollReveal } from "@/lib/useScrollReveal";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;
const PER_PAGE = 12; // 4 rows × 3 columns

type Filter = "all" | PropertyStatus;
type Sort = "score" | "yield" | "district";

export default function PropertiesPage() {
  const [marketData, setMarketData] = useState<RVDMarketSnapshot | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketProperties, setMarketProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("score");
  const [page, setPage] = useState(0);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/market-snapshot")
      .then((r) => r.json())
      .then((data) => {
        setMarketData(data);
        setMarketLoading(false);
      })
      .catch(() => setMarketLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/market-properties")
      .then((r) => r.json())
      .then((list: Property[]) => setMarketProperties(Array.isArray(list) ? list : []))
      .catch(() => setMarketProperties([]));
  }, []);

  const combined = useMemo(() => [...PROPERTIES, ...marketProperties], [marketProperties]);

  const filtered = useMemo(() => {
    let list = [...combined];
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    if (sort === "score") list.sort((a, b) => b.ai_score - a.ai_score);
    else if (sort === "yield") list.sort((a, b) => b.net_yield_pct - a.net_yield_pct);
    else list.sort((a, b) => a.district.localeCompare(b.district));
    return list;
  }, [combined, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = useMemo(
    () => filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE),
    [filtered, currentPage]
  );

  useEffect(() => {
    setPage(0);
  }, [filter, sort]);

  const [cardsContainerRef, listVisible] = useScrollReveal("visible", 0.1);

  const handleAnalyze = useCallback(async (property: Property) => {
    if (property.status !== "from_market") return;
    setAnalyzingId(property.id);
    try {
      const res = await fetch("/api/enrich-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing: {
            id: property.id.replace(/^market-/, ""),
            address: property.address,
            district: property.district,
            price_hkd: property.current_valuation_hkd ?? 0,
            size_sqft: property.size_sqft,
            rooms: property.rooms,
            monthly_rent_hkd: property.monthly_rent_hkd,
            listing_status: "for_sale",
            url: property.listing_url,
          },
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMarketProperties((prev) =>
        prev.map((p) =>
          p.id === property.id
            ? {
                ...p,
                name: data.translated_name ?? p.name,
                address: data.translated_address ?? p.address,
                ai_score: data.ai_score ?? p.ai_score,
                ai_recommendation: data.ai_recommendation ?? p.ai_recommendation,
                ai_buy_reasons: data.ai_buy_reasons ?? p.ai_buy_reasons,
                ai_concerns: data.ai_concerns ?? p.ai_concerns,
                gross_yield_pct: data.gross_yield_pct ?? p.gross_yield_pct,
                net_yield_pct: (data.gross_yield_pct ?? p.gross_yield_pct) * 0.85,
              }
            : p
        )
      );
    } finally {
      setAnalyzingId(null);
    }
  }, []);

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
          {(["all", "in_portfolio", "analyzing", "rejected", "from_market"] as const).map((f) => (
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
              {({ all: "All", in_portfolio: "In Portfolio", analyzing: "Analyzing", rejected: "Rejected", from_market: "From market" } as const)[f]}
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

        <div
          ref={cardsContainerRef as React.RefObject<HTMLDivElement>}
          className={marketLoading ? "" : `stagger-reveal visible`}
        >
          {marketLoading ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <li key={i}>
                  <div className="card overflow-hidden p-5">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton mt-2 h-4 w-full" />
                    <div className="skeleton mt-4 h-2 w-24" />
                    <div className="skeleton mt-6 h-10 w-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((p) => (
                  <li key={p.id} className="stagger-item">
                    <PropertyCard
                      property={p}
                      onAnalyze={p.status === "from_market" ? handleAnalyze : undefined}
                      isAnalyzing={analyzingId === p.id}
                      animateScore={listVisible}
                    />
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                  <span className="w-full text-center text-sm text-[var(--color-muted)] sm:w-auto">
                    {filtered.length > 0
                      ? `${currentPage * PER_PAGE + 1}–${Math.min((currentPage + 1) * PER_PAGE, filtered.length)} of ${filtered.length}`
                      : "0 properties"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPage(i)}
                        className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          i === currentPage
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Next →
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>

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

        <div className="mx-auto max-w-2xl border-t border-[var(--color-border)] px-4 py-12 text-center sm:px-6">
          <h2
            className="text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Not finding what you need? Join the waitlist.
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Tell us your preferences — we&apos;ll notify you when a matching room opens up in our portfolio.
          </p>
          <Link
            href="/register"
            className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}
