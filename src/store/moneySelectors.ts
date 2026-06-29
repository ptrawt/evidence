import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { todayISO } from '../lib/constants'

const selectAllMoney = (s: RootState) => s.money.entries

export const selectTodayMoney = createSelector(selectAllMoney, entries =>
  entries.filter(e => e.date === todayISO()),
)

export const selectTodayExpenses = createSelector(selectTodayMoney, entries =>
  entries.filter(e => e.type === 'expense'),
)

export const selectTodayExpenseTotal = createSelector(selectTodayExpenses, entries =>
  entries.reduce((sum, e) => sum + e.amount, 0),
)

export const selectMonthMoney = createSelector(selectAllMoney, entries => {
  const month = todayISO().slice(0, 7)
  return entries.filter(e => e.date.startsWith(month))
})

export const selectMonthExpenseTotal = createSelector(selectMonthMoney, entries =>
  entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
)

export const selectMonthSavingsTotal = createSelector(selectMonthMoney, entries =>
  entries.filter(e => e.type === 'savings').reduce((sum, e) => sum + e.amount, 0),
)

export const selectMonthImpulseCount = createSelector(selectMonthMoney, entries =>
  entries.filter(e => e.type === 'impulse_resisted').length,
)

export const selectMonthImpulseSaved = createSelector(selectMonthMoney, entries =>
  entries.filter(e => e.type === 'impulse_resisted').reduce((sum, e) => sum + e.amount, 0),
)

export const selectRecentMoney = createSelector(selectAllMoney, entries =>
  entries.slice(0, 30),
)
