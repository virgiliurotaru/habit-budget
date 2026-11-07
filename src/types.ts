export type TransactionType = 'expense' | 'income' | 'transfer'

export interface Category {
  id: string
  name: string
  group: string | null
  monthlyTarget: number | null
  kind: 'expense' | 'income'
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  note: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string | null
  date: string
  note: string
  createdAt: string
}

export interface BudgetState {
  categories: Category[]
  transactions: Transaction[]
  goals: Goal[]
  version: 1
}

export type View =
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'goals'
  | 'monthly'
  | 'review'
  | 'import'
