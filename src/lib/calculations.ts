import type { BudgetState, Category, Transaction } from '../types'
import { currentMonthKey, monthKey } from './format'

export function transactionsInMonth(
  transactions: Transaction[],
  key: string = currentMonthKey(),
): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === key)
}

export function monthCashFlow(transactions: Transaction[], key = currentMonthKey()) {
  const month = transactionsInMonth(transactions, key)
  let income = 0
  let expense = 0
  for (const t of month) {
    if (t.type === 'income') income += t.amount
    if (t.type === 'expense') expense += t.amount
  }
  return { income, expense, net: income - expense }
}

export function categorySpend(
  transactions: Transaction[],
  categoryId: string,
  key = currentMonthKey(),
): number {
  return transactionsInMonth(transactions, key)
    .filter((t) => t.type === 'expense' && t.categoryId === categoryId)
    .reduce((s, t) => s + t.amount, 0)
}

export function topCategories(
  state: BudgetState,
  key = currentMonthKey(),
  limit = 5,
): { category: Category; spent: number }[] {
  const spend = new Map<string, number>()
  for (const t of transactionsInMonth(state.transactions, key)) {
    if (t.type !== 'expense' || !t.categoryId) continue
    spend.set(t.categoryId, (spend.get(t.categoryId) ?? 0) + t.amount)
  }
  return [...spend.entries()]
    .map(([id, spent]) => ({
      category: state.categories.find((c) => c.id === id)!,
      spent,
    }))
    .filter((x) => x.category)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit)
}

/** Flexible spending left: income − expenses this month, calm framing. */
export function flexibleRemaining(transactions: Transaction[], key = currentMonthKey()) {
  const { income, expense, net } = monthCashFlow(transactions, key)
  return { income, expense, remaining: net }
}

export function uncategorizedCount(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type !== 'transfer' && !t.categoryId).length
}

export function weekRange(anchor = new Date()): { start: string; end: string } {
  const day = anchor.getDay()
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - ((day + 6) % 7))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start: toISO(start), end: toISO(end) }
}

export function transactionsInRange(
  transactions: Transaction[],
  start: string,
  end: string,
): Transaction[] {
  return transactions.filter((t) => t.date >= start && t.date <= end)
}
