import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { Pillar } from '../types'
import { todayISO } from '../lib/constants'

const selectEntries = (state: RootState) => state.evidence.entries
const selectPlanItems = (s: RootState) => s.planner.items

export const selectMonthWorkoutCount = createSelector(selectPlanItems, items => {
  const month = todayISO().slice(0, 7)
  return items.filter(i => i.type === 'workout' && i.completed && i.date.startsWith(month)).length
})

export const selectAllEntries = selectEntries

export const selectEntriesByPillar = (pillar: Pillar) =>
  createSelector(selectEntries, entries => entries.filter(e => e.pillar === pillar))

export const selectTotalXP = createSelector(
  selectEntries,
  entries => entries.reduce((sum, e) => sum + e.xp, 0),
)

export const selectXPByPillar = (pillar: Pillar) =>
  createSelector(selectEntries, entries =>
    entries.filter(e => e.pillar === pillar).reduce((sum, e) => sum + e.xp, 0),
  )

export const selectStreakByPillar = (pillar: Pillar) =>
  createSelector(selectEntries, entries => {
    const dates = entries
      .filter(e => e.pillar === pillar)
      .map(e => e.createdAt.slice(0, 10))
      .sort((a, b) => b.localeCompare(a))

    if (dates.length === 0) return 0

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 0
    let current = new Date(dates[0])

    for (const dateStr of dates) {
      const d = new Date(dateStr)
      const diff = Math.round((current.getTime() - d.getTime()) / 86400000)
      if (diff === 0) continue
      if (diff === 1) { streak++; current = d } else break
    }

    return streak + 1
  })

export const selectEvidenceCount = createSelector(selectEntries, e => e.length)

export const selectRecentEntries = (count: number) =>
  createSelector(selectEntries, entries => entries.slice(0, count))
