import type { BudgetState } from '../types'
import { createSeedData } from './seed'

const KEY = 'habit-budget-v1'

export function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const seed = createSeedData()
      saveState(seed)
      return seed
    }
    const parsed = JSON.parse(raw) as BudgetState
    if (!parsed?.version || !Array.isArray(parsed.transactions)) {
      const seed = createSeedData()
      saveState(seed)
      return seed
    }
    return parsed
  } catch {
    const seed = createSeedData()
    saveState(seed)
    return seed
  }
}

export function saveState(state: BudgetState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetToSeed(): BudgetState {
  const seed = createSeedData()
  saveState(seed)
  return seed
}

export function clearAll(): BudgetState {
  const empty: BudgetState = {
    version: 1,
    categories: [],
    transactions: [],
    goals: [],
  }
  saveState(empty)
  return empty
}
