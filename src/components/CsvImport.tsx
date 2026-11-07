import { useMemo, useState } from 'react'
import type { BudgetState, Transaction } from '../types'
import {
  downloadCsv,
  exportCsv,
  guessColumnMap,
  parseCsv,
  rowsToTransactions,
  type ColumnMap,
} from '../lib/csv'

interface CsvImportProps {
  state: BudgetState
  onImport: (txs: Transaction[]) => void
}

const FIELDS: { key: keyof ColumnMap; label: string; required?: boolean }[] = [
  { key: 'date', label: 'Date', required: true },
  { key: 'amount', label: 'Amount', required: true },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'note', label: 'Note / description' },
]

export function CsvImport({ state, onImport }: CsvImportProps) {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [map, setMap] = useState<ColumnMap>({
    date: null,
    amount: null,
    type: null,
    category: null,
    note: null,
  })
  const [message, setMessage] = useState('')

  const preview = useMemo(() => {
    if (!rows.length || map.date == null || map.amount == null) return []
    const lookup = new Map(state.categories.map((c) => [c.name.toLowerCase(), c.id]))
    return rowsToTransactions(rows.slice(0, 5), map, lookup)
  }, [rows, map, state.categories])

  function onFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const parsed = parseCsv(text)
      if (parsed.length < 2) {
        setMessage('Could not read rows from that file.')
        return
      }
      const [header, ...body] = parsed
      setHeaders(header)
      setRows(body)
      setMap(guessColumnMap(header))
      setMessage(`${body.length} rows ready to map.`)
    }
    reader.readAsText(file)
  }

  function runImport() {
    if (map.date == null || map.amount == null) {
      setMessage('Map at least date and amount columns.')
      return
    }
    const lookup = new Map(state.categories.map((c) => [c.name.toLowerCase(), c.id]))
    const txs = rowsToTransactions(rows, map, lookup)
    if (!txs.length) {
      setMessage('No valid transactions found with the current mapping.')
      return
    }
    onImport(txs)
    setMessage(`Imported ${txs.length} transactions.`)
    setHeaders([])
    setRows([])
  }

  function exportAll() {
    downloadCsv(`habit-budget-${new Date().toISOString().slice(0, 10)}.csv`, exportCsv(state))
  }

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Import & export</h1>
        <p className="mt-1 text-[var(--color-ink-soft)]">
          CSV in and out. Your data stays on this device — no bank sync.
        </p>
      </header>

      <section className="animate-fade-up surface flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <h2 className="font-display text-lg">Export everything</h2>
          <p className="text-sm text-[var(--color-muted)]">One-click full CSV download.</p>
        </div>
        <button
          type="button"
          onClick={exportAll}
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white"
        >
          Download CSV
        </button>
      </section>

      <section className="animate-fade-up space-y-4 surface rounded-2xl p-5">
        <div>
          <h2 className="font-display text-lg">Import CSV</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Map columns to Habit fields. Category names that match yours are linked automatically.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-8 text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]">
          <span>Drop a CSV here or click to choose</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
        </label>

        {headers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-ink)]">Column mapping</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="block text-sm">
                  <span className="mb-1 block text-[var(--color-muted)]">
                    {f.label}
                    {f.required ? ' *' : ''}
                  </span>
                  <select
                    value={map[f.key] ?? ''}
                    onChange={(e) =>
                      setMap((m) => ({
                        ...m,
                        [f.key]: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2"
                  >
                    <option value="">— skip —</option>
                    {headers.map((h, i) => (
                      <option key={`${h}-${i}`} value={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Preview</h3>
                <ul className="rounded-xl border border-[var(--color-line)] text-sm">
                  {preview.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between border-b border-[var(--color-line)] px-3 py-2 last:border-0"
                    >
                      <span>
                        {t.date} · {t.type} · {t.note || '—'}
                      </span>
                      <span className="tabular-nums">${t.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={runImport}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white"
            >
              Import {rows.length} rows
            </button>
          </div>
        )}

        {message && <p className="text-sm text-[var(--color-ink-soft)]">{message}</p>}
      </section>
    </div>
  )
}
