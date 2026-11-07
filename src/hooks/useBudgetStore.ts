import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { BudgetState, Category, Goal, Transaction } from '../types'
import { loadState, resetToSeed, saveState } from '../lib/storage'
import { uid } from '../lib/format'

let state: BudgetState = loadState()
const listeners = new Set<() => void>()

function emit() {
  saveState(state)
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function setState(next: BudgetState | ((prev: BudgetState) => BudgetState)) {
  state = typeof next === 'function' ? next(state) : next
  emit()
}

export function useBudgetStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const full: Transaction = {
      ...tx,
      id: uid(),
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, transactions: [full, ...s.transactions] }))
    return full
  }, [])

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const full: Category = { ...cat, id: uid() }
    setState((s) => ({ ...s, categories: [...s.categories, full] }))
    return full
  }, [])

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== id),
      transactions: s.transactions.map((t) =>
        t.categoryId === id ? { ...t, categoryId: null } : t,
      ),
    }))
  }, [])

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const full: Goal = { ...goal, id: uid() }
    setState((s) => ({ ...s, goals: [...s.goals, full] }))
    return full
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }))
  }, [])

  const importTransactions = useCallback((txs: Transaction[]) => {
    setState((s) => ({ ...s, transactions: [...txs, ...s.transactions] }))
  }, [])

  const batchCategorize = useCallback((ids: string[], categoryId: string | null) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) =>
        ids.includes(t.id) ? { ...t, categoryId } : t,
      ),
    }))
  }, [])

  const replaceAll = useCallback((next: BudgetState) => {
    setState(next)
  }, [])

  const resetSample = useCallback(() => {
    setState(resetToSeed())
  }, [])

  return {
    state: snapshot,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    importTransactions,
    batchCategorize,
    replaceAll,
    resetSample,
  }
}

/** Hydrate once on first client paint if storage changed elsewhere. */
export function useStorageHydration() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'habit-budget-v1' && e.newValue) {
        try {
          state = JSON.parse(e.newValue)
          listeners.forEach((l) => l())
          setTick((t) => t + 1)
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
}
