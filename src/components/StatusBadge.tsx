import type { PropertyStatus } from "@/types/property";

const LABELS: Record<PropertyStatus, string> = {
  in_portfolio: "🏠 IN PORTFOLIO",
  analyzing: "🔍 ANALYZING",
  rejected: "❌ REJECTED",
  from_market: "📊 FROM MARKET",
};

const STYLES: Record<PropertyStatus, string> = {
  in_portfolio: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/40",
  analyzing: "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/40",
  rejected: "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/40",
  from_market: "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/40",
};

type Props = { status: PropertyStatus; className?: string };

export default function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[status]} ${className}`}
    >
      {status === "in_portfolio" && <span className="pulse-dot" />}
      {LABELS[status]}
    </span>
  );
}
