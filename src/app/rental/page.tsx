"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import propertiesData from "@/data/properties.json";
import type { Property } from "@/types/property";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;
const IN_PORTFOLIO = PROPERTIES.filter((p) => p.status === "in_portfolio");

function formatHKD(n: number) {
  return "HKD " + n.toLocaleString("en-HK", { maximumFractionDigits: 0 });
}

function getMoveInMonths(count: number): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() + i, 1);
    const label = x.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    out.push({ value: label, label });
  }
  return out;
}

const DISTRICTS = [
  { id: "hk_island", label: "Hong Kong Island" },
  { id: "kowloon", label: "Kowloon" },
  { id: "new_territories", label: "New Territories" },
  { id: "any", label: "Any district" },
] as const;

const MOVE_IN_OPTIONS = [
  { id: "1m", label: "Within 1 month" },
  { id: "1_3m", label: "1–3 months" },
  { id: "3_6m", label: "3–6 months" },
  { id: "flexible", label: "Flexible" },
] as const;

export default function RentalPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [requestModalId, setRequestModalId] = useState<string | null>(null);
  const [requestSubmittedId, setRequestSubmittedId] = useState<string | null>(null);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const [joinMoveIn, setJoinMoveIn] = useState("");
  const [joinRoomType, setJoinRoomType] = useState<"any" | "single" | "double">("any");
  const [joinAbout, setJoinAbout] = useState("");
  const [joinEmail, setJoinEmail] = useState("");

  const [waitlistDistricts, setWaitlistDistricts] = useState<Record<string, boolean>>({});
  const [waitlistMinHkd, setWaitlistMinHkd] = useState("");
  const [waitlistMaxHkd, setWaitlistMaxHkd] = useState("");
  const [waitlistMoveIn, setWaitlistMoveIn] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");

  const moveInMonths = useMemo(() => getMoveInMonths(4), []);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) {
      router.replace("/login?from=/rental");
    }
  }, [mounted, router]);

  useEffect(() => {
    if (moveInMonths.length && !joinMoveIn) setJoinMoveIn(moveInMonths[0].value);
  }, [moveInMonths, joinMoveIn]);

  if (!mounted) return null;

  const propertyForModal = requestModalId ? IN_PORTFOLIO.find((p) => p.id === requestModalId) : null;

  function openRequestModal(id: string) {
    setRequestModalId(id);
    setRequestSubmittedId(null);
    setJoinMoveIn(moveInMonths[0]?.value ?? "");
    setJoinRoomType("any");
    setJoinAbout("");
    setJoinEmail("");
  }

  function closeRequestModal() {
    setRequestModalId(null);
  }

  function handleJoinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRequestModalId(null);
    if (requestModalId) setRequestSubmittedId(requestModalId);
  }

  function toggleDistrict(id: string) {
    setWaitlistDistricts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleWaitlistSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWaitlistSubmitted(true);
    setWaitlistDistricts({});
    setWaitlistMinHkd("");
    setWaitlistMaxHkd("");
    setWaitlistMoveIn("");
    setWaitlistEmail("");
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Block 1: Hero */}
        <section className="text-center">
          <h1
            className="section-heading text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Find Your Co-living Space
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">
            Rooms in Tenantshield-managed properties.
            <br />
            Real apartments. Vetted co-tenants. No agency fees.
          </p>
        </section>

        {/* Block 2: Property cards (in_portfolio only) */}
        <section className="mt-12 space-y-6">
          {IN_PORTFOLIO.map((p) => {
            const available = Math.max(0, p.rooms - p.tenants_current);
            const rentPerRoom = p.rooms > 0 ? Math.round(p.monthly_rent_hkd / p.rooms) : 0;
            const submitted = requestSubmittedId === p.id;

            return (
              <div key={p.id} className="card overflow-hidden p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--color-success)]/20 px-3 py-1 text-xs font-semibold text-[var(--color-success)] border border-[var(--color-success)]/40">
                    🏠 NOW RENTING
                  </span>
                </div>
                <h2
                  className="mt-4 text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
                >
                  {p.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  📍 {p.district}, {p.address.split(",")[0]}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                  {p.rooms} rooms total · {available} available · {p.size_sqft.toLocaleString()} sqft
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-[var(--color-primary)] font-medium">
                    From {formatHKD(rentPerRoom)} / room / month
                  </span>
                  <span className="ml-2 text-[var(--color-muted)]">
                    ({formatHKD(p.monthly_rent_hkd)} total floor)
                  </span>
                </p>
                {p.features?.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Features: {p.features.join(" · ")}
                  </p>
                )}
                <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4">
                  {submitted ? (
                    <p className="text-sm text-[var(--color-success)]">
                      ✅ Request submitted. We&apos;ll match you with co-tenants and reach out within 48h.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--color-muted)]">Looking for co-tenants?</p>
                      <button
                        type="button"
                        onClick={() => openRequestModal(p.id)}
                        className="mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        Request to Join This Property →
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Divider */}
        <div className="mt-16 flex flex-col items-center gap-2 border-t border-[var(--color-border)] pt-12">
          <p className="text-center text-[var(--color-muted)]">
            Can&apos;t find the right property above?
          </p>
          <p className="text-center font-medium text-[var(--color-text)]">
            Tell us what you&apos;re looking for.
          </p>
        </div>

        {/* Block 3: Waitlist form */}
        <section className="mt-12">
          <h2
            className="section-heading text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Not finding what you need? Join the waitlist.
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Tell us your preferences — we&apos;ll notify you when a matching room opens up in our portfolio.
          </p>

          {waitlistSubmitted ? (
            <p className="mt-6 rounded-lg border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 p-4 text-sm text-[var(--color-success)]">
              ✅ You&apos;re on the waitlist. We&apos;ll reach out when a matching room opens up.
            </p>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="card mt-6 space-y-6 p-6">
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-text)]">District preference</p>
                <div className="flex flex-wrap gap-4">
                  {DISTRICTS.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <input
                        type="checkbox"
                        checked={waitlistDistricts[d.id] ?? false}
                        onChange={() => toggleDistrict(d.id)}
                        className="rounded border-[var(--color-border)]"
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Monthly budget per room (HKD)</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={waitlistMinHkd}
                    onChange={(e) => setWaitlistMinHkd(e.target.value)}
                    className="w-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  />
                  <span className="text-[var(--color-muted)]">—</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={waitlistMaxHkd}
                    onChange={(e) => setWaitlistMaxHkd(e.target.value)}
                    className="w-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Current rooms in portfolio: HKD 6,800 – 8,500/mo
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Move-in timeline</p>
                <div className="flex flex-wrap gap-4">
                  {MOVE_IN_OPTIONS.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <input
                        type="radio"
                        name="waitlist_movein"
                        value={o.id}
                        checked={waitlistMoveIn === o.id}
                        onChange={() => setWaitlistMoveIn(o.id)}
                        className="border-[var(--color-border)]"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="waitlist-email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Contact email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-[var(--color-text)]"
                />
              </div>
              <button type="submit" className="btn-primary rounded-full px-6 py-3 text-sm">
                Join Waitlist →
              </button>
            </form>
          )}
        </section>

        {/* Block 4: Invest CTA */}
        <section className="mt-16">
          <div className="card border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6">
            <p className="text-lg font-semibold text-[var(--color-text)]">
              💡 Rather earn from rent than pay it?
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              These same properties generate income for Tenantshield token holders.
            </p>
            <Link
              href="/invest"
              className="btn-primary mt-4 inline-flex rounded-full px-6 py-3 text-sm"
            >
              Invest from HKD 1,000 →
            </Link>
          </div>
        </section>
      </div>

      {/* Modal: Request to Join */}
      {requestModalId && propertyForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeRequestModal}
          onKeyDown={(e) => e.key === "Escape" && closeRequestModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={0}
        >
          <div
            className="card w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <h2 id="modal-title" className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              Join Co-living: {propertyForModal.name}
            </h2>
            <form onSubmit={handleJoinSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="join-movein" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Move-in month
                </label>
                <select
                  id="join-movein"
                  value={joinMoveIn}
                  onChange={(e) => setJoinMoveIn(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-text)]"
                >
                  {moveInMonths.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Preferred room type</p>
                <div className="space-y-2">
                  {(["any", "single", "double"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <input
                        type="radio"
                        name="room_type"
                        value={opt}
                        checked={joinRoomType === opt}
                        onChange={() => setJoinRoomType(opt)}
                        className="border-[var(--color-border)]"
                      />
                      {opt === "any" && "Any available"}
                      {opt === "single" && "Single occupancy"}
                      {opt === "double" && "Double occupancy"}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="join-about" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  About you (optional)
                </label>
                <textarea
                  id="join-about"
                  rows={2}
                  value={joinAbout}
                  onChange={(e) => setJoinAbout(e.target.value)}
                  placeholder="student / working professional / other"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                />
              </div>
              <div>
                <label htmlFor="join-email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Your contact (email)
                </label>
                <input
                  id="join-email"
                  type="email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-text)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="flex-1 rounded-full border border-[var(--color-border)] py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 rounded-full py-2 text-sm">
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
