import { useMemo } from 'react'
import type { BudgetState } from '../types'
import { transactionsInRange, weekRange } from '../lib/calculations'
import { formatDate, formatMoney } from '../lib/format'

interface WeeklyReviewProps {
  state: BudgetState
  onCategorize: (ids: string[], categoryId: string | null) => void
}

export function WeeklyReview({ state, onCategorize }: WeeklyReviewProps) {
  const { start, end } = weekRange()
  const weekTx = useMemo(
    () =>
      transactionsInRange(state.transactions, start, end).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    [state.transactions, start, end],
  )

  let income = 0
  let expense = 0
  for (const t of weekTx) {
    if (t.type === 'income') income += t.amount
    if (t.type === 'expense') expense += t.amount
  }

  const needsCategory = weekTx.filter((t) => t.type !== 'transfer' && !t.categoryId)

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Weekly review</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">
          {formatDate(start)} – {formatDate(end)}. A short look back — nothing to fix, just notice.
        </p>
      </header>

      <section className="stagger grid gap-4 sm:grid-cols-3">
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Income</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{formatMoney(income)}</p>
        </div>
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Spending</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{formatMoney(expense)}</p>
        </div>
        <div className="animate-fade-up surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Logged</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{weekTx.length}</p>
        </div>
      </section>

      {needsCategory.length > 0 && (
        <section className="animate-fade-up surface rounded-2xl p-5">
          <h2 className="mb-3 font-display text-lg">Untagged this week</h2>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            Assign a category when you have a moment — or leave them for later.
          </p>
          <ul className="space-y-3">
            {needsCategory.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{t.note || 'Untitled'}</span>
                  <span className="text-[var(--color-muted)]">
                    {' '}
                    · {formatDate(t.date)} · {formatMoney(t.amount)}
                  </span>
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => onCategorize([t.id], e.target.value || null)}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 text-sm"
                >
                  <option value="">Choose…</option>
                  {state.categories
                    .filter((c) => c.kind === (t.type === 'income' ? 'income' : 'expense'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="animate-fade-up surface overflow-hidden rounded-2xl">
        <h2 className="border-b border-[var(--color-line)] px-5 py-3 font-display text-lg">
          This week&apos;s activity
        </h2>
        <ul className="divide-y divide-[var(--color-line)]">
          {weekTx.length === 0 && (
            <li className="p-5 text-sm text-[var(--color-muted)]">
              Quiet week so far — press N when something comes up.
            </li>
          )}
          {weekTx.map((t) => {
            const cat = state.categories.find((c) => c.id === t.categoryId)
            return (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{t.note || cat?.name || t.type}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatDate(t.date)}
                    {cat ? ` · ${cat.name}` : ''}
                  </p>
                </div>
                <span className="tabular-nums">
                  {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}
                  {formatMoney(t.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
