import { useCallback, useEffect, useState } from 'react'
import type { View } from './types'
import { useBudgetStore, useStorageHydration } from './hooks/useBudgetStore'
import { downloadCsv, exportCsv } from './lib/csv'
import { Layout } from './components/Layout'
import { QuickAdd } from './components/QuickAdd'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import { CategoriesView } from './components/CategoriesView'
import { GoalsView } from './components/GoalsView'
import { MonthlyOverview } from './components/MonthlyOverview'
import { WeeklyReview } from './components/WeeklyReview'
import { CsvImport } from './components/CsvImport'

export default function App() {
  useStorageHydration()
  const store = useBudgetStore()
  const [view, setView] = useState<View>('dashboard')
  const [txFilter, setTxFilter] = useState<'uncategorized' | null>(null)
  const [quickOpen, setQuickOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('habit-budget-theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('habit-budget-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (typing) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setQuickOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openUncategorized = useCallback(() => {
    setTxFilter('uncategorized')
    setView('transactions')
  }, [])

  const navigate = useCallback((v: View) => {
    if (v !== 'transactions') setTxFilter(null)
    setView(v)
  }, [])

  return (
    <>
      <Layout
        view={view}
        onNavigate={navigate}
        onAdd={() => setQuickOpen(true)}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onExport={() =>
          downloadCsv(
            `habit-budget-${new Date().toISOString().slice(0, 10)}.csv`,
            exportCsv(store.state),
          )
        }
        onResetSample={() => {
          if (confirm('Replace all local data with sample transactions?')) {
            store.resetSample()
            setView('dashboard')
          }
        }}
      >
        {view === 'dashboard' && (
          <Dashboard
            state={store.state}
            onOpenAdd={() => setQuickOpen(true)}
            onOpenUncategorized={openUncategorized}
          />
        )}
        {view === 'transactions' && (
          <TransactionList
            key={txFilter ?? 'all'}
            state={store.state}
            initialFilter={txFilter}
            onDelete={store.deleteTransaction}
            onCategorize={store.batchCategorize}
          />
        )}
        {view === 'categories' && (
          <CategoriesView
            state={store.state}
            onAdd={store.addCategory}
            onUpdate={store.updateCategory}
            onDelete={store.deleteCategory}
          />
        )}
        {view === 'goals' && (
          <GoalsView
            state={store.state}
            onAdd={store.addGoal}
            onUpdate={store.updateGoal}
            onDelete={store.deleteGoal}
          />
        )}
        {view === 'monthly' && <MonthlyOverview state={store.state} />}
        {view === 'review' && (
          <WeeklyReview state={store.state} onCategorize={store.batchCategorize} />
        )}
        {view === 'import' && (
          <CsvImport state={store.state} onImport={store.importTransactions} />
        )}
      </Layout>

      <QuickAdd
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        categories={store.state.categories}
        onSave={(data) => store.addTransaction(data)}
      />
    </>
  )
}
