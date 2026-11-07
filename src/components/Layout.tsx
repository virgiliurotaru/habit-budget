import type { ReactNode } from 'react'
import type { View } from '../types'
import {
  CalendarDays,
  Download,
  FolderTree,
  LayoutDashboard,
  List,
  Moon,
  Sun,
  Target,
  Sparkles,
} from 'lucide-react'

interface LayoutProps {
  view: View
  onNavigate: (view: View) => void
  onAdd: () => void
  dark: boolean
  onToggleDark: () => void
  onExport: () => void
  onResetSample: () => void
  children: ReactNode
}

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Activity', icon: List },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'monthly', label: 'Month', icon: CalendarDays },
  { id: 'review', label: 'Review', icon: Sparkles },
  { id: 'import', label: 'CSV', icon: Download },
]

export function Layout({
  view,
  onNavigate,
  onAdd,
  dark,
  onToggleDark,
  onExport,
  onResetSample,
  children,
}: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:flex-row lg:gap-8 lg:pb-8 lg:pt-8">
      <aside className="mb-6 flex shrink-0 flex-col gap-4 lg:mb-0 lg:w-52">
        <div className="hidden lg:block">
          <p className="font-display text-2xl text-[var(--color-accent)]">Habit</p>
          <p className="text-xs text-[var(--color-muted)]">Local-first budgeting</p>
        </div>

        <nav className="hidden flex-col gap-1 lg:flex" aria-label="Main">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                view === id
                  ? 'bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-accent-soft)]/50'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 lg:flex">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-[var(--color-accent)] px-3 py-2.5 text-sm font-medium text-white"
          >
            New · N
          </button>
          <button
            type="button"
            onClick={onExport}
            className="rounded-xl border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-ink-soft)]"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onToggleDark}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-muted)]"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light' : 'Dark'}
          </button>
          <button
            type="button"
            onClick={onResetSample}
            className="px-3 py-1 text-left text-xs text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
          >
            Reload sample data
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-surface-raised)_92%,transparent)] px-1 py-2 backdrop-blur-md lg:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-lg items-center gap-0.5 overflow-x-auto">
          <button
            type="button"
            onClick={onAdd}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg font-medium text-white"
            aria-label="Add transaction"
          >
            +
          </button>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex min-w-[3.25rem] flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] ${
                view === id ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
