import Link from "next/link";
import type { Property, AIRecommendation } from "@/types/property";
import StatusBadge from "./StatusBadge";
import AIScoreBadge from "./AIScoreBadge";

function recommendationColor(rec: AIRecommendation): string {
  if (rec === "BUY") return "var(--color-success)";
  if (rec === "HOLD") return "var(--color-warning)";
  return "var(--color-danger)";
}

type Props = { readonly property: Property };

export default function PropertyCard({ property }: Props) {
  const {
    id,
    name,
    address,
    district,
    ai_score,
    status,
    net_yield_pct,
    ai_recommendation,
    ai_growth_forecast_pct,
    risk_level,
    acquired_date,
    acquired_price_hkd,
    current_valuation_hkd,
  } = property;

  const formatHKD = (n: number) =>
    new Intl.NumberFormat("en-HK", { style: "decimal", maximumFractionDigits: 0 }).format(n);

  return (
    <Link
      href={`/properties/${id}`}
      className="card group block overflow-hidden transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-[0_0_0_1px_var(--color-primary),0_0_24px_rgba(0,212,255,0.12)]"
    >
      <div className="relative aspect-[16/10] bg-[var(--color-border)]">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
            No image
          </div>
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="p-5">
        <h3
          className="font-bold text-white line-clamp-1"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          {name}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          📍 {district}, {address.split(",")[0]}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <AIScoreBadge score={ai_score} />
          <span
            className="text-xs font-medium uppercase"
            style={{
              fontFamily: "var(--font-ibm-plex-mono)",
              color: recommendationColor(ai_recommendation),
            }}
          >
            {ai_recommendation}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
          <span className="text-[var(--color-muted)]">Net yield:</span>
          <span className="text-[var(--color-primary)]">{net_yield_pct.toFixed(1)}%/yr</span>
          <span className="text-[var(--color-muted)]">·</span>
          <span className="text-[var(--color-muted)]">AI growth:</span>
          <span>+{ai_growth_forecast_pct.toFixed(1)}%/yr</span>
          <span className="text-[var(--color-muted)]">·</span>
          <span>Risk: {risk_level}</span>
        </div>
        {status === "in_portfolio" && acquired_date && acquired_price_hkd != null && current_valuation_hkd != null && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Acquired {acquired_date} · {formatHKD(acquired_price_hkd)} → {formatHKD(current_valuation_hkd)} (
            {(((current_valuation_hkd - acquired_price_hkd) / acquired_price_hkd) * 100).toFixed(1)}%)
          </p>
        )}
        <p className="mt-3 text-sm font-medium text-[var(--color-primary)] group-hover:underline">
          Full AI Report ↓
        </p>
      </div>
    </Link>
  );
}
