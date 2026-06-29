import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { todayISO, dateOffsetISO } from '../lib/constants'

const selectAll = (s: RootState) => s.knowledge.entries

export const selectTodayKnowledge = createSelector(selectAll, entries =>
  entries.filter(e => e.date === todayISO()),
)

export const selectTodayMinutes = createSelector(selectTodayKnowledge, entries =>
  entries.reduce((sum, e) => sum + e.minutes, 0),
)

export const selectWeekKnowledge = createSelector(selectAll, entries => {
  const start = dateOffsetISO(6)
  return entries.filter(e => e.date >= start)
})

export const selectWeekMinutes = createSelector(selectWeekKnowledge, entries =>
  entries.reduce((sum, e) => sum + e.minutes, 0),
)

export const selectWeekTopics = createSelector(selectWeekKnowledge, entries =>
  [...new Set(entries.map(e => e.topic))].length,
)

export const selectCareerEntries = createSelector(selectAll, entries =>
  entries.filter(e => e.pillar === 'career'),
)

export const selectMindEntries = createSelector(selectAll, entries =>
  entries.filter(e => e.pillar === 'mind'),
)

export const selectRecentKnowledge = createSelector(selectAll, entries =>
  entries.slice(0, 40),
)
