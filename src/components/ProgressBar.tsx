interface ProgressBarProps {
  value: number
  max: number
  label?: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-[var(--color-ink-soft)]">{label}</span>
          <span className="tabular-nums text-[var(--color-muted)]">{pct}%</span>
        </div>
      )}
      <div className="progress-track h-2 overflow-hidden rounded-full">
        <div
          className="progress-fill h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
