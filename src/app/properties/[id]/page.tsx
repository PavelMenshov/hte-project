import { notFound } from "next/navigation";
import Link from "next/link";
import propertiesData from "@/data/properties.json";
import { getMarketProperty } from "@/lib/market-properties";
import type { Property } from "@/types/property";
import StatusBadge from "@/components/StatusBadge";
import InvestCTABlock from "@/components/InvestCTABlock";
import PropertyAICard from "@/components/PropertyAICard";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;

type Props = { params: Promise<{ id: string }> };

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  let property = PROPERTIES.find((p) => p.id === id);
  if (!property && id.startsWith("market-")) {
    property = await getMarketProperty(id) ?? null;
  }
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
            {property.status === "from_market" && property.listing_url && (
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted)]">
                  Full description, photos and contact are on the listing site.
                </p>
                <a
                  href={property.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block p-4 text-center font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                >
                  {property.listing_url.includes("28hse") ? "View full listing on 28hse →" : "View full listing →"}
                </a>
              </div>
            )}
            <PropertyAICard property={property} />
            <InvestCTABlock />
          </div>
        </div>
      </div>
    </div>
  );
}
