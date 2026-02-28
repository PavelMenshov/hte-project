type Props = { score: number; max?: number; showLabel?: boolean; className?: string };

export default function AIScoreBadge({ score, max = 10, showLabel = true, className = "" }: Props) {
  const pct = Math.min(100, (score / max) * 100);
  const color =
    score >= 8
      ? "var(--color-success)"
      : score >= 6
        ? "var(--color-warning)"
        : "var(--color-danger)";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color }}
        >
          {score.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
}
