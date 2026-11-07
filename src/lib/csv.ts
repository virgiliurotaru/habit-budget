import type { BudgetState, Transaction, TransactionType } from '../types'
import { todayISO, uid } from './format'

export function exportCsv(state: BudgetState): string {
  const catName = (id: string | null) =>
    id ? state.categories.find((c) => c.id === id)?.name ?? '' : ''

  const rows = [
    ['date', 'amount', 'type', 'category', 'note'].join(','),
    ...[...state.transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) =>
        [
          t.date,
          t.amount.toFixed(2),
          t.type,
          escapeCsv(catName(t.categoryId)),
          escapeCsv(t.note),
        ].join(','),
      ),
  ]
  return rows.join('\n')
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell.trim())
      cell = ''
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(cell.trim())
      if (row.some((c) => c.length)) rows.push(row)
      row = []
      cell = ''
      if (ch === '\r') i++
    } else if (ch !== '\r') {
      cell += ch
    }
  }
  row.push(cell.trim())
  if (row.some((c) => c.length)) rows.push(row)
  return rows
}

export type ColumnMap = {
  date: number | null
  amount: number | null
  type: number | null
  category: number | null
  note: number | null
}

export function guessColumnMap(headers: string[]): ColumnMap {
  const lower = headers.map((h) => h.toLowerCase())
  const find = (...keys: string[]) => {
    const i = lower.findIndex((h) => keys.some((k) => h.includes(k)))
    return i >= 0 ? i : null
  }
  return {
    date: find('date', 'posted', 'time'),
    amount: find('amount', 'value', 'sum'),
    type: find('type', 'flow', 'direction'),
    category: find('category', 'cat', 'label'),
    note: find('note', 'memo', 'description', 'desc', 'payee'),
  }
}

export function rowsToTransactions(
  rows: string[][],
  map: ColumnMap,
  categoryLookup: Map<string, string>,
): Transaction[] {
  if (map.date == null || map.amount == null) return []

  const out: Transaction[] = []
  for (const row of rows) {
    const dateRaw = row[map.date]?.trim()
    const amountRaw = row[map.amount]?.replace(/[$,]/g, '').trim()
    if (!dateRaw || !amountRaw) continue

    let amount = Number.parseFloat(amountRaw)
    if (!Number.isFinite(amount) || amount === 0) continue

    let type: TransactionType = 'expense'
    const typeRaw = map.type != null ? row[map.type]?.toLowerCase() ?? '' : ''
    if (typeRaw.includes('income') || typeRaw.includes('credit') || typeRaw.includes('in')) {
      type = 'income'
    } else if (typeRaw.includes('transfer')) {
      type = 'transfer'
    } else if (amount < 0) {
      amount = Math.abs(amount)
      type = 'expense'
    } else if (!typeRaw && amount > 0 && map.type == null) {
      // Heuristic: positive without type column stays expense (bank exports vary)
      type = 'expense'
    }

    const catName = map.category != null ? row[map.category]?.trim() : ''
    const categoryId = catName ? categoryLookup.get(catName.toLowerCase()) ?? null : null
    const note = map.note != null ? row[map.note] ?? '' : ''

    const date = normalizeDate(dateRaw) ?? todayISO()

    out.push({
      id: uid(),
      amount: Math.abs(amount),
      type,
      categoryId,
      date,
      note,
      createdAt: new Date().toISOString(),
    })
  }
  return out
}

function normalizeDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
