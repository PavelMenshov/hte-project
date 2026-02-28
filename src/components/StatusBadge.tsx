import type { PropertyStatus } from "@/types/property";

const LABELS: Record<PropertyStatus, string> = {
  in_portfolio: "✅ IN PORTFOLIO",
  analyzing: "🔍 ANALYZING",
  rejected: "❌ REJECTED",
};

const STYLES: Record<PropertyStatus, string> = {
  in_portfolio: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/40",
  analyzing: "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/40",
  rejected: "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/40",
};

type Props = { status: PropertyStatus; className?: string };

export default function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}
