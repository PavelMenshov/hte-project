"use client";

import { useState, useEffect } from "react";

const DISTRICTS = ["Sai Kung", "Tuen Mun", "Sha Tin", "Tai Po", "Clear Water Bay"] as const;
const MOVE_IN_MONTHS = (() => {
  const now = new Date();
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  });
})();

export default function CollectivePage() {
  const [district, setDistrict] = useState<string>(DISTRICTS[0]);
  const [budget, setBudget] = useState<string>("12000");
  const [moveIn, setMoveIn] = useState<string>(MOVE_IN_MONTHS[0]);
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [avgBudget, setAvgBudget] = useState(0);

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
  }

  const budgetNum = Number(budget) || 0;
  const discount = 0.18;
  const savingsPerMonth = Math.round(budgetNum * discount);
  const savingsPerYear = savingsPerMonth * 12;

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
          </div>
        )}
      </main>
    </div>
  );
}
