import Link from "next/link";
import type { Property, AIRecommendation } from "@/types/property";
import StatusBadge from "./StatusBadge";
import AIScoreBadge from "./AIScoreBadge";

function recommendationColor(rec: AIRecommendation): string {
  if (rec === "BUY") return "var(--color-success)";
  if (rec === "HOLD") return "var(--color-warning)";
  return "var(--color-danger)";
}

type Props = {
  readonly property: Property;
  readonly onAnalyze?: (property: Property) => void | Promise<void>;
  readonly isAnalyzing?: boolean;
  readonly animateScore?: boolean;
};

export default function PropertyCard({ property, onAnalyze, isAnalyzing, animateScore }: Props) {
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
      className="card group block overflow-hidden rounded-[4px] transition-[border-color,box-shadow] duration-200 hover:border-l-[3px] hover:border-l-[var(--gold)] animate-fade-up"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-[var(--text)] line-clamp-1 flex-1"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            {name}
          </h3>
          <StatusBadge status={status} />
        </div>
        <p className="mt-1 text-sm text-[var(--text-2)]">
          📍 {district}, {address.split(",")[0]}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <AIScoreBadge score={ai_score} animate={animateScore} />
          <span
            className="text-xs font-medium uppercase"
            style={{
              fontFamily: "var(--font-dm-mono), monospace",
              color: recommendationColor(ai_recommendation),
            }}
          >
            {ai_recommendation}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
          <span className="text-[var(--text-2)]">Net yield:</span>
          <span className="text-[var(--gold)]">{net_yield_pct.toFixed(1)}%/yr</span>
          <span className="text-[var(--text-2)]">·</span>
          <span className="text-[var(--text-2)]">AI growth:</span>
          <span>+{ai_growth_forecast_pct.toFixed(1)}%/yr</span>
          <span className="text-[var(--text-2)]">·</span>
          <span>Risk: {risk_level}</span>
        </div>
        {status === "in_portfolio" && acquired_date && acquired_price_hkd != null && current_valuation_hkd != null && (
          <p className="mt-2 text-xs text-[var(--text-2)]">
            Acquired {acquired_date} · {formatHKD(acquired_price_hkd)} → {formatHKD(current_valuation_hkd)} (
            {(((current_valuation_hkd - acquired_price_hkd) / acquired_price_hkd) * 100).toFixed(1)}%)
          </p>
        )}
        {onAnalyze && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAnalyze(property);
            }}
            disabled={isAnalyzing}
            className="mt-3 w-full rounded border border-[var(--gold)] bg-transparent px-3 py-2 text-sm font-medium text-[var(--gold)] transition hover:bg-[var(--gold)]/10 disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing…" : "Run AI analysis"}
          </button>
        )}
        <p className="mt-3 text-sm font-medium text-[var(--gold)] group-hover:underline">
          Full AI Report ↓
        </p>
      </div>
    </Link>
  );
}
