import { useMemo, useState, type FormEvent } from 'react'
import type { BudgetState, Category } from '../types'
import { categorySpend } from '../lib/calculations'
import { formatMoney } from '../lib/format'
import { ProgressBar } from './ProgressBar'

interface CategoriesViewProps {
  state: BudgetState
  onAdd: (cat: Omit<Category, 'id'>) => void
  onUpdate: (id: string, patch: Partial<Category>) => void
  onDelete: (id: string) => void
}

export function CategoriesView({ state, onAdd, onUpdate, onDelete }: CategoriesViewProps) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [kind, setKind] = useState<'expense' | 'income'>('expense')
  const [target, setTarget] = useState('')

  const groups = useMemo(() => {
    const map = new Map<string, Category[]>()
    for (const c of state.categories) {
      const key = c.group || 'Ungrouped'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [state.categories])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      group: group.trim() || null,
      kind,
      monthlyTarget: target ? Number.parseFloat(target) : null,
    })
    setName('')
    setTarget('')
  }

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Categories</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">
          Keep a short list. Groups and monthly targets are optional.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="animate-fade-up surface grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
          required
        />
        <input
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Group (optional)"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'expense' | 'income')}
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Monthly target"
          inputMode="decimal"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2 font-medium text-white"
        >
          Add category
        </button>
      </form>

      <div className="space-y-6">
        {groups.map(([groupName, cats]) => (
          <section key={groupName} className="animate-fade-up">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              {groupName}
            </h2>
            <ul className="surface divide-y divide-[var(--color-line)] overflow-hidden rounded-2xl">
              {cats.map((c) => {
                const spent = c.kind === 'expense' ? categorySpend(state.transactions, c.id) : 0
                return (
                  <li key={c.id} className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{c.name}</p>
                        <p className="text-xs capitalize text-[var(--color-muted)]">{c.kind}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                          Target
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={c.monthlyTarget ?? ''}
                            placeholder="—"
                            onChange={(e) =>
                              onUpdate(c.id, {
                                monthlyTarget: e.target.value
                                  ? Number.parseFloat(e.target.value)
                                  : null,
                              })
                            }
                            className="w-24 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 tabular-nums"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          className="rounded-lg px-2 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-warm)]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {c.kind === 'expense' && c.monthlyTarget != null && (
                      <ProgressBar
                        value={spent}
                        max={c.monthlyTarget}
                        label={`${formatMoney(spent)} of ${formatMoney(c.monthlyTarget)}`}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        {state.categories.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No categories yet.</p>
        )}
      </div>
    </div>
  )
}
