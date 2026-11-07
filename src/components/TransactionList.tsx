import { useMemo, useState } from 'react'
import type { BudgetState, TransactionType } from '../types'
import { formatDate, formatMoney } from '../lib/format'

interface TransactionListProps {
  state: BudgetState
  initialFilter?: 'uncategorized' | null
  onDelete: (id: string) => void
  onCategorize: (ids: string[], categoryId: string | null) => void
}

export function TransactionList({
  state,
  initialFilter,
  onDelete,
  onCategorize,
}: TransactionListProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [uncategorizedOnly, setUncategorizedOnly] = useState(initialFilter === 'uncategorized')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchCategory, setBatchCategory] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...state.transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false
        if (uncategorizedOnly && (t.categoryId || t.type === 'transfer')) return false
        if (!q) return true
        const cat = state.categories.find((c) => c.id === t.categoryId)?.name ?? ''
        return (
          t.note.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        )
      })
  }, [state, query, typeFilter, uncategorizedOnly])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function applyBatch() {
    if (!selected.size) return
    onCategorize([...selected], batchCategory || null)
    setSelected(new Set())
  }

  return (
    <div className="space-y-5">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Transactions</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">Search, filter, and tidy as you go.</p>
      </header>

      <div className="animate-fade-up flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, categories, amounts…"
          className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-3 py-2.5 text-[var(--color-ink)]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-3 py-2.5"
        >
          <option value="all">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
          <option value="transfer">Transfers</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <input
            type="checkbox"
            checked={uncategorizedOnly}
            onChange={(e) => setUncategorizedOnly(e.target.checked)}
          />
          Needs category
        </label>
      </div>

      {selected.size > 0 && (
        <div className="surface flex flex-wrap items-center gap-2 rounded-xl p-3">
          <span className="text-sm text-[var(--color-ink-soft)]">{selected.size} selected</span>
          <select
            value={batchCategory}
            onChange={(e) => setBatchCategory(e.target.value)}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 text-sm"
          >
            <option value="">Uncategorized</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyBatch}
            className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white"
          >
            Apply category
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-sm text-[var(--color-muted)]"
          >
            Clear
          </button>
        </div>
      )}

      <ul className="surface divide-y divide-[var(--color-line)] overflow-hidden rounded-2xl">
        {filtered.length === 0 && (
          <li className="p-6 text-sm text-[var(--color-muted)]">No matching transactions.</li>
        )}
        {filtered.map((t) => {
          const cat = state.categories.find((c) => c.id === t.categoryId)
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[color-mix(in_oklab,var(--color-accent-soft)_40%,transparent)]"
            >
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)}
                aria-label="Select transaction"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium text-[var(--color-ink)]">
                    {t.note || cat?.name || (t.type === 'transfer' ? 'Transfer' : 'Untitled')}
                  </span>
                  <span className="text-xs capitalize text-[var(--color-muted)]">{t.type}</span>
                </div>
                <p className="truncate text-xs text-[var(--color-muted)]">
                  {formatDate(t.date)}
                  {cat && t.note ? ` · ${cat.name}` : ''}
                  {!cat && t.type !== 'transfer' ? ' · Uncategorized' : ''}
                </p>
              </div>
              <span
                className={`tabular-nums text-sm font-medium ${
                  t.type === 'income'
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink)]'
                }`}
              >
                {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}
                {formatMoney(t.amount)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                className="rounded-lg px-2 py-1 text-xs text-[var(--color-muted)] hover:bg-[var(--color-warm-soft)] hover:text-[var(--color-warm)]"
              >
                Delete
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
