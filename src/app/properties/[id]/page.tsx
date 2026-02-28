import { notFound } from "next/navigation";
import Link from "next/link";
import propertiesData from "@/data/properties.json";
import type { Property } from "@/types/property";
import StatusBadge from "@/components/StatusBadge";
import AIScoreBadge from "@/components/AIScoreBadge";
import InvestCTABlock from "@/components/InvestCTABlock";
import LiveAnalysisBlock from "@/components/LiveAnalysisBlock";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;

type Props = { params: Promise<{ id: string }> };

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const property = PROPERTIES.find((p) => p.id === id);
  if (!property) notFound();

  const formatHKD = (n: number) =>
    new Intl.NumberFormat("en-HK", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " HKD";

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/properties"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
        >
          ← Back to portfolio
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-5">
          {/* Left: photo + facts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--color-border)]">
              {property.images?.[0] ? (
                <img src={property.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--color-muted)]">No image</div>
              )}
            </div>
            <div className="card p-5">
              <h2
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
              >
                {property.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{property.address}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{property.district} · {property.type}</p>
              <div className="mt-4">
                <StatusBadge status={property.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Rooms</dt>
                  <dd>{property.rooms}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Size</dt>
                  <dd>{property.size_sqft} sq ft</dd>
                </div>
                {property.acquired_date && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-[var(--color-muted)]">Acquired</dt>
                      <dd>{property.acquired_date}</dd>
                    </div>
                    {property.acquired_price_hkd != null && (
                      <div className="flex justify-between">
                        <dt className="text-[var(--color-muted)]">Acquired price</dt>
                        <dd>{formatHKD(property.acquired_price_hkd)}</dd>
                      </div>
                    )}
                  </>
                )}
                {property.current_valuation_hkd != null && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-muted)]">Current value</dt>
                    <dd>{formatHKD(property.current_valuation_hkd)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Monthly rent</dt>
                  <dd>{formatHKD(property.monthly_rent_hkd)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-muted)]">Tenants</dt>
                  <dd>{property.tenants_current} / {property.tenants_max}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right: AI report */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h3
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
              >
                🤖 AI Acquisition Analysis
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Powered by AWS Bedrock AgentCore</p>
              <div className="mt-4 flex items-center gap-4">
                <span
                  className={`text-lg font-bold ${
                    property.ai_recommendation === "BUY"
                      ? "text-[var(--color-success)]"
                      : property.ai_recommendation === "HOLD"
                        ? "text-[var(--color-warning)]"
                        : "text-[var(--color-danger)]"
                  }`}
                >
                  RECOMMENDATION: {property.ai_recommendation}
                </span>
                <AIScoreBadge score={property.ai_score} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
                  <span className="text-[var(--color-muted)]">Yield</span>
                  <span className="ml-2 font-mono text-[var(--color-primary)]">{property.net_yield_pct.toFixed(1)}%/yr</span>
                </div>
                <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
                  <span className="text-[var(--color-muted)]">Growth</span>
                  <span className="ml-2 font-mono">+{property.ai_growth_forecast_pct.toFixed(1)}%/yr</span>
                </div>
                <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
                  <span className="text-[var(--color-muted)]">Risk</span>
                  <span className="ml-2 font-mono">{property.risk_level}</span>
                </div>
              </div>
              {property.ai_buy_reasons.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-[var(--color-success)]">Why AI recommended {property.ai_recommendation}:</h4>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--color-text)]">
                    {property.ai_buy_reasons.map((r, i) => (
                      <li key={i}>✅ {r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {property.ai_concerns.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-[var(--color-warning)]">Concerns:</h4>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                    {property.ai_concerns.map((c, i) => (
                      <li key={i}>⚠️ {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {property.ai_rejected_alternatives.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-[var(--color-muted)]">Properties AI rejected (same period):</h4>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                    {property.ai_rejected_alternatives.map((a, i) => (
                      <li key={i}>❌ {a.description} — {a.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <LiveAnalysisBlock propertyId={property.id} />

            <InvestCTABlock />
          </div>
        </div>
      </div>
    </div>
  );
}
