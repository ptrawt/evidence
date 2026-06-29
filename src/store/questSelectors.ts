import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import type { Pillar } from '../types'

const selectQuests = (s: RootState) => s.quests.quests
const selectCompletions = (s: RootState) => s.quests.completions

export const selectQuestsByPillar = (pillar: Pillar) =>
  createSelector(selectQuests, quests => quests.filter(q => q.pillar === pillar))

export const selectTodayCompletedIds = createSelector(
  selectCompletions,
  completions => new Set(completions.map(c => c.questId)),
)

export const selectCompletionByQuestId = (questId: string) =>
  createSelector(selectCompletions, completions => completions.find(c => c.questId === questId))

export const selectTodayXP = createSelector(
  selectQuests,
  selectTodayCompletedIds,
  (quests, completedIds) =>
    quests.filter(q => completedIds.has(q.id)).reduce((s, q) => s + q.xp, 0),
)

export const selectPillarProgress = (pillar: Pillar) =>
  createSelector(selectQuests, selectTodayCompletedIds, (quests, completedIds) => {
    const pQuests = quests.filter(q => q.pillar === pillar)
    const done = pQuests.filter(q => completedIds.has(q.id)).length
    return { total: pQuests.length, done }
  })

export const selectQuestsStatus = (s: RootState) => s.quests.status

export const selectStreak = createSelector(
  (s: RootState) => s.evidence.entries,
  entries => {
    const days = [...new Set(entries.map(e => e.createdAt.slice(0, 10)))]
      .sort((a, b) => b.localeCompare(a))
    if (days.length === 0) return 0
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (days[0] !== today && days[0] !== yesterday) return 0
    let streak = 1
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round(
        (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000
      )
      if (diff === 1) streak++
      else break
    }
    return streak
  },
)

export const selectWeekSummary = createSelector(
  (s: RootState) => s.quests.weekCompletions,
  selectQuests,
  (weekCompletions, quests) => {
    const today = new Date()
    const dow = (today.getDay() + 6) % 7  // 0=Mon … 6=Sun
    const daysElapsed = dow + 1
    const total = quests.length * daysElapsed
    return { done: weekCompletions.length, total }
  },
)
