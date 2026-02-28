"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Square, Calendar, ShieldCheck, Star } from "lucide-react";
import { getSession, type AuthUser } from "@/lib/auth";

type Listing = {
  id: string;
  title: string;
  address: string;
  district: string;
  price: number;
  size_sqft: number;
  bedrooms: number;
  available_from: string;
  features: string[];
  landlord_rating: number;
  verified: boolean;
  source_url: string;
  scraped_at: string;
};

const DISTRICTS = ["Sai Kung", "Tuen Mun", "Sha Tin", "Tai Po", "Clear Water Bay"] as const;
const MOVE_IN_MONTHS = (() => {
  const now = new Date();
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  });
})();

export default function CollectivePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const [district, setDistrict] = useState<string>(DISTRICTS[0]);
  const [budget, setBudget] = useState<string>("12000");
  const [moveIn, setMoveIn] = useState<string>(MOVE_IN_MONTHS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [avgBudget, setAvgBudget] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setAuthChecked(true);
    if (!session) router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!submitted) return;
    const target = 23 + Math.floor(Math.random() * (67 - 23 + 1));
    setTargetCount(target);
    const budgetNum = Number(budget) || 12000;
    setAvgBudget(Math.round(budgetNum * 0.95 + Math.random() * budgetNum * 0.1));
    const start = Date.now();
    const duration = 1500;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      setCount(Math.round(target * (1 - (1 - t) ** 2)));
      if (t >= 1) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [submitted, budget]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setListingsLoading(true);
    fetch("/listings.json")
      .then((r) => r.json())
      .then((data: { listings: Listing[] }) => {
        const budgetNum = Number(budget) || 0;
        const filtered = data.listings.filter(
          (l) =>
            l.district === district &&
            l.price <= budgetNum * 1.15
        );
        filtered.sort((a, b) => {
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          return a.price - b.price;
        });
        setListings(data.listings);
        setFilteredListings(filtered);
        setListingsLoading(false);
      })
      .catch(() => setListingsLoading(false));
  }

  const budgetNum = Number(budget) || 0;
  const discount = 0.18;
  const savingsPerMonth = Math.round(budgetNum * discount);
  const savingsPerYear = savingsPerMonth * 12;

  if (!authChecked) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="section-heading text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Collective Rent Pool
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Join anonymously. We aggregate demand and send one offer to landlords—you get a group discount.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="card mt-8 space-y-6 p-6">
            <div>
              <label htmlFor="collective-district" className="block text-sm font-medium text-[var(--color-text)]">District</label>
              <select
                id="collective-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="collective-budget" className="block text-sm font-medium text-[var(--color-text)]">Budget (HKD / month)</label>
              <input
                id="collective-budget"
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              {Number(budget) > 0 && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  We&apos;ll show listings up to HKD {(Number(budget) * 1.15).toLocaleString()} (+15% flex range)
                </p>
              )}
            </div>
            <div>
              <label htmlFor="collective-movein" className="block text-sm font-medium text-[var(--color-text)]">Move-in month</label>
              <select
                id="collective-movein"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {MOVE_IN_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full rounded-full py-3 text-sm">
              Join the pool
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="card p-6">
              <p className="text-lg font-medium text-[var(--color-text)]">
                You joined the pool. Currently <span className="font-bold text-[var(--color-primary)]">{count}</span> students in {district} with average budget $<span className="font-bold text-[var(--color-primary)]">{avgBudget.toLocaleString()}</span> HKD.
              </p>
            </div>

            <div className="card border-[var(--color-primary)]/20 p-6" style={{ boxShadow: "0 0 0 1px var(--color-border), 0 4px 24px rgba(0,212,255,0.06)" }}>
              <h2 className="font-bold text-white">Collective offer sent to 4 landlords in {district}</h2>
              <ul className="mt-4 space-y-2 text-[var(--color-muted)]">
                <li className="flex items-center gap-2">✅ Pool formed (just now)</li>
                <li className="flex items-center gap-2">⏳ Landlords notified (in progress)</li>
                <li className="flex items-center gap-2">⏳ Offers expected within 24h</li>
              </ul>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-white">Savings estimate</h2>
              <p className="mt-2 text-[var(--color-muted)]">Individual rent: ${budgetNum.toLocaleString()} HKD/month</p>
              <p className="mt-1 text-[var(--color-muted)]">Estimated collective discount: 18%</p>
              <p className="mt-2 font-semibold text-[var(--color-primary)]">
                Your savings: ${savingsPerMonth.toLocaleString()} HKD/month = ${savingsPerYear.toLocaleString()} HKD/year
              </p>
            </div>

            <p className="text-center text-sm text-[var(--color-muted)]">
              Your identity is never revealed to landlords.<br />
              Powered by Abelian anonymous transactions.
            </p>

            {submitted && (
              <div className="mt-10">
                {listingsLoading ? (
                  <div className="card animate-pulse p-6">
                    <div className="mb-3 h-4 w-48 rounded bg-[var(--color-border)]" />
                    <div className="h-4 w-32 rounded bg-[var(--color-border)]" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2
                        className="section-heading text-xl font-bold text-white"
                        style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
                      >
                        Available in {district}
                      </h2>
                      <span className="text-sm text-[var(--color-muted)]">
                        {filteredListings.length > 0
                          ? `${filteredListings.length} listings within budget`
                          : "No exact matches — showing nearby"}
                      </span>
                    </div>

                    {filteredListings.length === 0 && (
                      <div className="card mt-4 border-[var(--color-warning)]/50 p-4">
                        <p className="text-sm text-[var(--color-muted)]">
                          No listings found within HKD {Number(budget).toLocaleString()} in {district}. Showing all available — consider adjusting your budget or joining the Collective Pool to negotiate a lower price.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 space-y-4">
                      {(filteredListings.length > 0 ? filteredListings : listings.filter((l) => l.district === district)).map((l) => (
                        <div
                          key={l.id}
                          className="card p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_0_24px_rgba(0,212,255,0.2)]"
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>{l.title}</h3>
                              <p className="mt-0.5 text-sm text-[var(--color-muted)]">{l.address}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-start sm:items-end">
                              <span className="text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
                                HKD {l.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-[var(--color-muted)]">/month</span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-4 w-4" />
                              {l.bedrooms} bed
                            </span>
                            <span className="flex items-center gap-1">
                              <Square className="h-4 w-4" />
                              {l.size_sqft} sqft
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              From {new Date(l.available_from).toLocaleDateString("en-HK", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {l.features.map((f) => (
                              <span
                                key={f}
                                className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i <= Math.floor(l.landlord_rating) ? "fill-amber-400 text-amber-400" : "text-[var(--color-border)]"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-[var(--color-muted)]">{l.landlord_rating} landlord score</span>
                              {l.verified ? (
                                <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                                  <ShieldCheck className="h-4 w-4" />
                                  TenantShield Verified
                                </span>
                              ) : (
                                <span className="text-xs text-[var(--color-muted)]">Unverified</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={l.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--color-primary)] hover:underline"
                              >
                                View listing →
                              </a>
                              <button
                                type="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text)] transition hover:border-[var(--color-primary)]"
                              >
                                Join pool for this
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {listings.length > 0 && (
                      <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
                        Listings sourced from Squarefoot, Spacious, 28Hse via TenantShield scraper agent. Last updated:{" "}
                        {new Date(
                          listings.reduce((latest, x) => (x.scraped_at > latest ? x.scraped_at : latest), listings[0]?.scraped_at ?? "")
                        ).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
