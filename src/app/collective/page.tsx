"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">
            ← TenantShield
          </Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">
            Pitch
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Collective Rent Pool</h1>
        <p className="mt-2 text-slate-600">
          Join anonymously. We aggregate demand and send one offer to landlords—you get a group discount.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Budget (HKD / month)</label>
              <input
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Move-in month</label>
              <select
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              >
                {MOVE_IN_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#2563eb] py-3 font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Join the pool
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-medium text-slate-800">
                You joined the pool. Currently <span className="font-bold text-[#2563eb]">{count}</span> students in {district} with average budget $<span className="font-bold text-[#2563eb]">{avgBudget.toLocaleString()}</span> HKD.
              </p>
            </div>

            <div className="rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-6">
              <h2 className="font-bold text-slate-900">Collective offer sent to 4 landlords in {district}</h2>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li className="flex items-center gap-2">✅ Pool formed (just now)</li>
                <li className="flex items-center gap-2">⏳ Landlords notified (in progress)</li>
                <li className="flex items-center gap-2">⏳ Offers expected within 24h</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Savings estimate</h2>
              <p className="mt-2 text-slate-700">Individual rent: ${budgetNum.toLocaleString()} HKD/month</p>
              <p className="mt-1 text-slate-700">Estimated collective discount: 18%</p>
              <p className="mt-2 font-semibold text-[#2563eb]">
                Your savings: ${savingsPerMonth.toLocaleString()} HKD/month = ${savingsPerYear.toLocaleString()} HKD/year
              </p>
            </div>

            <p className="text-center text-sm text-slate-500">
              Your identity is never revealed to landlords.<br />
              Powered by Abelian anonymous transactions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
