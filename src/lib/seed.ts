import type { BudgetState, Category, Goal, Transaction } from '../types'
import { todayISO, toISODate, uid } from './format'

function dayThisMonth(day: number): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const clamped = Math.min(Math.max(1, day), last)
  return toISODate(new Date(d.getFullYear(), d.getMonth(), clamped))
}

function recentDay(offsetFromToday: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetFromToday)
  // Keep sample activity inside the current month when possible
  if (d.getMonth() !== new Date().getMonth()) {
    return dayThisMonth(1)
  }
  return toISODate(d)
}

export function createSeedData(): BudgetState {
  const cats: Category[] = [
    { id: uid(), name: 'Groceries', group: 'Everyday', monthlyTarget: 450, kind: 'expense' },
    { id: uid(), name: 'Dining out', group: 'Everyday', monthlyTarget: 200, kind: 'expense' },
    { id: uid(), name: 'Transit', group: 'Everyday', monthlyTarget: 120, kind: 'expense' },
    { id: uid(), name: 'Rent', group: 'Home', monthlyTarget: 1600, kind: 'expense' },
    { id: uid(), name: 'Utilities', group: 'Home', monthlyTarget: 180, kind: 'expense' },
    { id: uid(), name: 'Streaming', group: 'Home', monthlyTarget: 45, kind: 'expense' },
    { id: uid(), name: 'Salary', group: 'Income', monthlyTarget: null, kind: 'income' },
    { id: uid(), name: 'Side projects', group: 'Income', monthlyTarget: null, kind: 'income' },
  ]

  const [groceries, dining, transit, rent, utilities, streaming, salary, side] = cats

  const goals: Goal[] = [
    {
      id: uid(),
      name: 'Emergency cushion',
      targetAmount: 5000,
      currentAmount: 2100,
      note: 'Three months of calm',
    },
    {
      id: uid(),
      name: 'Weekend trip',
      targetAmount: 800,
      currentAmount: 340,
      note: 'Spring getaway',
    },
  ]

  const tx: Transaction[] = [
    { id: uid(), amount: 4200, type: 'income', categoryId: salary.id, date: dayThisMonth(1), note: 'Monthly pay', createdAt: new Date().toISOString() },
    { id: uid(), amount: 1600, type: 'expense', categoryId: rent.id, date: dayThisMonth(1), note: 'Rent', createdAt: new Date().toISOString() },
    { id: uid(), amount: 86.4, type: 'expense', categoryId: groceries.id, date: recentDay(25), note: 'Weekly shop', createdAt: new Date().toISOString() },
    { id: uid(), amount: 32.5, type: 'expense', categoryId: dining.id, date: recentDay(24), note: 'Lunch with Sam', createdAt: new Date().toISOString() },
    { id: uid(), amount: 48, type: 'expense', categoryId: transit.id, date: recentDay(23), note: 'Transit pass', createdAt: new Date().toISOString() },
    { id: uid(), amount: 142.1, type: 'expense', categoryId: utilities.id, date: recentDay(20), note: 'Electric + water', createdAt: new Date().toISOString() },
    { id: uid(), amount: 15.99, type: 'expense', categoryId: streaming.id, date: recentDay(18), note: '', createdAt: new Date().toISOString() },
    { id: uid(), amount: 74.2, type: 'expense', categoryId: groceries.id, date: recentDay(17), note: '', createdAt: new Date().toISOString() },
    { id: uid(), amount: 250, type: 'income', categoryId: side.id, date: recentDay(14), note: 'Freelance invoice', createdAt: new Date().toISOString() },
    { id: uid(), amount: 41.8, type: 'expense', categoryId: dining.id, date: recentDay(12), note: 'Dinner', createdAt: new Date().toISOString() },
    { id: uid(), amount: 63.55, type: 'expense', categoryId: groceries.id, date: recentDay(10), note: '', createdAt: new Date().toISOString() },
    { id: uid(), amount: 22, type: 'expense', categoryId: transit.id, date: recentDay(8), note: 'Rideshare', createdAt: new Date().toISOString() },
    { id: uid(), amount: 200, type: 'transfer', categoryId: null, date: recentDay(7), note: 'To savings', createdAt: new Date().toISOString() },
    { id: uid(), amount: 28.9, type: 'expense', categoryId: dining.id, date: recentDay(5), note: '', createdAt: new Date().toISOString() },
    { id: uid(), amount: 91.3, type: 'expense', categoryId: groceries.id, date: recentDay(3), note: 'Farmers market', createdAt: new Date().toISOString() },
    { id: uid(), amount: 18.5, type: 'expense', categoryId: null, date: recentDay(2), note: 'Bookstore', createdAt: new Date().toISOString() },
    { id: uid(), amount: 12.75, type: 'expense', categoryId: null, date: recentDay(1), note: 'Coffee beans', createdAt: new Date().toISOString() },
    { id: uid(), amount: 55, type: 'expense', categoryId: dining.id, date: todayISO(), note: 'Brunch', createdAt: new Date().toISOString() },
  ]

  return {
    version: 1,
    categories: cats,
    transactions: tx,
    goals,
  }
}
