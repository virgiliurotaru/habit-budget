import { useState, type FormEvent } from 'react'
import type { BudgetState, Goal } from '../types'
import { formatMoney } from '../lib/format'
import { ProgressBar } from './ProgressBar'

interface GoalsViewProps {
  state: BudgetState
  onAdd: (goal: Omit<Goal, 'id'>) => void
  onUpdate: (id: string, patch: Partial<Goal>) => void
  onDelete: (id: string) => void
}

export function GoalsView({ state, onAdd, onUpdate, onDelete }: GoalsViewProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [note, setNote] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const t = Number.parseFloat(target)
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return
    onAdd({
      name: name.trim(),
      targetAmount: t,
      currentAmount: Number.parseFloat(current) || 0,
      note: note.trim(),
    })
    setName('')
    setTarget('')
    setCurrent('')
    setNote('')
  }

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Goals</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">
          Gentle progress bars — no streak pressure, just direction.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="animate-fade-up surface grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Goal name"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
          required
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target $"
          inputMode="decimal"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
          required
        />
        <input
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Saved so far"
          inputMode="decimal"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2 font-medium text-white"
        >
          Add goal
        </button>
      </form>

      <ul className="space-y-4">
        {state.goals.map((g) => (
          <li key={g.id} className="animate-fade-up surface rounded-2xl p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-[var(--color-ink)]">{g.name}</h2>
                {g.note && <p className="text-sm text-[var(--color-muted)]">{g.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => onDelete(g.id)}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-warm)]"
              >
                Remove
              </button>
            </div>
            <ProgressBar
              value={g.currentAmount}
              max={g.targetAmount}
              label={`${formatMoney(g.currentAmount)} of ${formatMoney(g.targetAmount)}`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-xs text-[var(--color-muted)]">Update saved</label>
              <input
                type="number"
                min={0}
                step="1"
                value={g.currentAmount}
                onChange={(e) =>
                  onUpdate(g.id, { currentAmount: Number.parseFloat(e.target.value) || 0 })
                }
                className="w-28 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5 tabular-nums"
              />
              <button
                type="button"
                onClick={() =>
                  onUpdate(g.id, { currentAmount: Math.min(g.targetAmount, g.currentAmount + 50) })
                }
                className="rounded-lg border border-[var(--color-line)] px-2 py-1 text-xs text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]"
              >
                +$50
              </button>
            </div>
          </li>
        ))}
        {state.goals.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No goals yet.</p>
        )}
      </ul>
    </div>
  )
}
