type Props = { score: number; max?: number; showLabel?: boolean; className?: string; animate?: boolean };

export default function AIScoreBadge({ score, max = 10, showLabel = true, className = "", animate }: Props) {
  const pct = Math.min(100, (score / max) * 100);
  const fillColor = "var(--gold)";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={`h-full rounded-full ${animate ? "bar-animated" : ""} transition-all duration-500`}
          style={
            animate
              ? { ["--bar-target" as string]: `${pct}%`, background: `linear-gradient(90deg, var(--gold-dim), var(--gold))` }
              : { width: `${pct}%`, background: `linear-gradient(90deg, var(--gold-dim), var(--gold))` }
          }
        />
      </div>
      {showLabel && (
        <span
          className="text-sm font-semibold tabular-nums text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold-dim)] rounded px-1.5 py-0.5"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          {score.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
}
