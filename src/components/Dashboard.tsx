import type { BudgetState } from '../types'
import {
  flexibleRemaining,
  monthCashFlow,
  topCategories,
  uncategorizedCount,
} from '../lib/calculations'
import { formatMoney, formatMonthLabel } from '../lib/format'
import { ProgressBar } from './ProgressBar'

interface DashboardProps {
  state: BudgetState
  onOpenUncategorized: () => void
  onOpenAdd: () => void
}

export function Dashboard({ state, onOpenUncategorized, onOpenAdd }: DashboardProps) {
  const now = new Date()
  const { income, expense, net } = monthCashFlow(state.transactions)
  const { remaining } = flexibleRemaining(state.transactions)
  const top = topCategories(state)
  const unc = uncategorizedCount(state.transactions)

  return (
    <div className="space-y-8">
      <header className="animate-fade-up space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {formatMonthLabel(now.getFullYear(), now.getMonth())}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Habit
        </h1>
        <p className="max-w-xl text-[var(--color-ink-soft)]">
          Quiet money tracking. Local on this device — build the habit, skip the guilt.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenAdd}
            className="animate-soft-pulse rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white"
          >
            Add transaction
            <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-[11px]">N</kbd>
          </button>
          {unc > 0 && (
            <button
              type="button"
              onClick={onOpenUncategorized}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-4 py-2.5 text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]"
            >
              {unc} to categorize
            </button>
          )}
        </div>
      </header>

      <section className="stagger grid gap-4 sm:grid-cols-3">
        <StatCard label="Income" value={formatMoney(income)} delay />
        <StatCard label="Spending" value={formatMoney(expense)} delay />
        <StatCard
          label="Still available"
          value={formatMoney(remaining, { signed: true })}
          hint={net >= 0 ? 'Room left this month' : 'Drawn from savings this month'}
          delay
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="animate-fade-up surface rounded-2xl p-5">
          <h2 className="mb-4 font-display text-lg text-[var(--color-ink)]">Top categories</h2>
          {top.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No spending logged yet this month.</p>
          ) : (
            <ul className="space-y-4">
              {top.map(({ category, spent }) => {
                const target = category.monthlyTarget
                return (
                  <li key={category.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-ink)]">
                        {category.name}
                      </span>
                      <span className="tabular-nums text-sm text-[var(--color-ink-soft)]">
                        {formatMoney(spent)}
                        {target != null && (
                          <span className="text-[var(--color-muted)]"> / {formatMoney(target)}</span>
                        )}
                      </span>
                    </div>
                    {target != null ? (
                      <ProgressBar value={spent} max={target} />
                    ) : (
                      <div className="progress-track h-1.5 overflow-hidden rounded-full">
                        <div
                          className="progress-fill h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (spent / (top[0]?.spent || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="animate-fade-up surface rounded-2xl p-5" style={{ animationDelay: '0.08s' }}>
          <h2 className="mb-4 font-display text-lg text-[var(--color-ink)]">Goals</h2>
          {state.goals.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No goals yet — add one when you are ready.</p>
          ) : (
            <ul className="space-y-5">
              {state.goals.map((g) => (
                <li key={g.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{g.name}</p>
                      {g.note && (
                        <p className="text-xs text-[var(--color-muted)]">{g.note}</p>
                      )}
                    </div>
                    <span className="tabular-nums text-sm text-[var(--color-ink-soft)]">
                      {formatMoney(g.currentAmount)} / {formatMoney(g.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar value={g.currentAmount} max={g.targetAmount} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
  delay?: boolean
}) {
  return (
    <div className="animate-fade-up surface rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl tabular-nums text-[var(--color-ink)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  )
}
