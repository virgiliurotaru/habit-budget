import { useMemo, useState } from 'react'
import type { BudgetState } from '../types'
import { categorySpend, monthCashFlow, transactionsInMonth } from '../lib/calculations'
import { formatMoney, formatMonthLabel, monthKey } from '../lib/format'
import { ProgressBar } from './ProgressBar'

interface MonthlyOverviewProps {
  state: BudgetState
}

export function MonthlyOverview({ state }: MonthlyOverviewProps) {
  const months = useMemo(() => {
    const set = new Set(state.transactions.map((t) => monthKey(t.date)))
    const now = new Date()
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    return [...set].sort().reverse()
  }, [state.transactions])

  const [selected, setSelected] = useState(months[0])
  const flow = monthCashFlow(state.transactions, selected)
  const txs = transactionsInMonth(state.transactions, selected)
  const [y, m] = selected.split('-').map(Number)

  const expenseCats = state.categories
    .filter((c) => c.kind === 'expense')
    .map((c) => ({
      category: c,
      spent: categorySpend(state.transactions, c.id, selected),
    }))
    .filter((x) => x.spent > 0 || x.category.monthlyTarget != null)
    .sort((a, b) => b.spent - a.spent)

  return (
    <div className="space-y-6">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--color-ink)]">Monthly overview</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">
            A calm snapshot of cash flow and category pace.
          </p>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-3 py-2"
        >
          {months.map((mk) => {
            const [yy, mm] = mk.split('-').map(Number)
            return (
              <option key={mk} value={mk}>
                {formatMonthLabel(yy, mm - 1)}
              </option>
            )
          })}
        </select>
      </header>

      <section className="stagger grid gap-4 sm:grid-cols-3">
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Income</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{formatMoney(flow.income)}</p>
        </div>
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Spending</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{formatMoney(flow.expense)}</p>
        </div>
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Net</p>
          <p className="mt-2 font-display text-3xl tabular-nums">
            {formatMoney(flow.net, { signed: true })}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {txs.length} transactions in {formatMonthLabel(y, m - 1)}
          </p>
        </div>
      </section>

      <section className="animate-fade-up surface rounded-2xl p-5">
        <h2 className="mb-4 font-display text-lg">Categories this month</h2>
        {expenseCats.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Nothing recorded here yet.</p>
        ) : (
          <ul className="space-y-4">
            {expenseCats.map(({ category, spent }) => (
              <li key={category.id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="tabular-nums text-[var(--color-ink-soft)]">
                    {formatMoney(spent)}
                    {category.monthlyTarget != null && (
                      <span className="text-[var(--color-muted)]">
                        {' '}
                        / {formatMoney(category.monthlyTarget)}
                      </span>
                    )}
                  </span>
                </div>
                <ProgressBar
                  value={spent}
                  max={category.monthlyTarget ?? Math.max(spent, 1)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
