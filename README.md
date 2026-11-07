# Habit

Calm, local-first personal budgeting. Fast transaction entry, flexible categories, and CSV import/export — no bank sync, no guilt UI.

## Philosophy

- **Low friction** — press `N` anytime to log money; amount is focused first
- **No shame** — no red over-budget styling or judgmental copy
- **Local privacy** — data lives in your browser (`localStorage`)
- **CSV over sync** — import/export instead of Plaid
- **Habit over bloat** — a short MVP that supports weekly review

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Sample data is seeded on first load so you can explore immediately. Use **Reload sample data** in the sidebar to reset.

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Features

1. **Fast entry** — `N` shortcut, expense/income/transfer, smart category filter, Enter keeps the form open
2. **Categories** — CRUD, optional groups & monthly targets, uncategorized + batch categorize
3. **Dashboard** — month cash flow, “still available”, top categories, goals
4. **Activity** — search/filter; monthly overview; goals with progress
5. **CSV** — column-mapped import, one-click full export; weekly review mode
6. **Dark mode** — toggle in the sidebar

## Keyboard

| Key | Action |
|-----|--------|
| `N` | Open quick-add |
| `Enter` | Save transaction (stays open) |
| `Esc` | Close modal |

## Data

Everything is stored under the `habit-budget-v1` key in `localStorage`. Export CSV anytime for a portable backup. Nothing leaves your device unless you download or import a file.

## Stack

React · Vite · TypeScript · Tailwind CSS v4
