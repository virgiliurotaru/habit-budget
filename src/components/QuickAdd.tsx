import { useEffect, useRef, useState } from 'react'
import type { Category, TransactionType } from '../types'
import { todayISO } from '../lib/format'
import { Modal } from './Modal'

interface QuickAddProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  onSave: (data: {
    amount: number
    type: TransactionType
    categoryId: string | null
    date: string
    note: string
  }) => void
}

const TYPES: { id: TransactionType; label: string }[] = [
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfer' },
]

export function QuickAdd({ open, onClose, categories, onSave }: QuickAddProps) {
  const amountRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState<string>('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setType('expense')
    setCategoryId('')
    setDate(todayISO())
    setNote('')
    setSavedFlash(false)
    const t = window.setTimeout(() => amountRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    setCategoryId('')
  }, [type])

  const filtered = categories.filter((c) => {
    if (type === 'transfer') return false
    if (type === 'income') return c.kind === 'income'
    return c.kind === 'expense'
  })

  function submit(keepOpen: boolean) {
    const value = Number.parseFloat(amount)
    if (!Number.isFinite(value) || value <= 0) {
      amountRef.current?.focus()
      return
    }
    onSave({
      amount: value,
      type,
      categoryId: type === 'transfer' ? null : categoryId || null,
      date,
      note: note.trim(),
    })
    if (keepOpen) {
      setAmount('')
      setNote('')
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 900)
      amountRef.current?.focus()
    } else {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add transaction">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit(true)
        }}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              $
            </span>
            <input
              ref={amountRef}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 pl-8 pr-3 text-2xl tabular-nums text-[var(--color-ink)] placeholder:text-[var(--color-line)]"
            />
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-[var(--color-accent-soft)] p-1">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                type === t.id
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-accent)] shadow-sm'
                  : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type !== 'transfer' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)]"
            >
              <option value="">Uncategorized</option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.group ? `${c.group} · ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Note
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-[var(--color-ink)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[var(--color-muted)]">
            {savedFlash ? 'Saved — add another' : 'Enter saves & stays open'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submit(false)}
              className="rounded-xl px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-accent-soft)]"
            >
              Save & close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
