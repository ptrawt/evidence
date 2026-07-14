import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { todayISO } from '../lib/constants'
import { todayWeekDay } from '../lib/db/workoutSplit'
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary'
import { aggregateWorkoutStats } from '../lib/workoutStats'

const selectFoodEntries = (state: RootState) => state.food.entries
const selectWeightEntries = (state: RootState) => state.weight.entries
export const selectBodySettings = (state: RootState) => state.bodySettings

export const selectWorkoutSessions = (state: RootState) => state.workout.sessions
export const selectActiveWorkout = (state: RootState) => state.workout.active
export const selectWorkoutSplit = (state: RootState) => state.workoutSplit

export const selectTodayWorkoutSessions = createSelector(
  selectWorkoutSessions,
  sessions => sessions.filter(s => s.date === todayISO()),
)

export const selectTodayWorkoutStats = createSelector(
  selectTodayWorkoutSessions,
  aggregateWorkoutStats,
)

export const selectTodaySplitExercises = createSelector(
  selectWorkoutSplit,
  split => split[todayWeekDay()],
)

const selectCustomExercises = (state: RootState) => state.customExercises.items
export const selectExerciseTargets = (state: RootState) => state.exerciseTargets
export const selectExerciseInfo = (state: RootState) => state.exerciseInfo

export const selectExerciseOptions = createSelector(
  selectCustomExercises,
  custom => Array.from(new Set([...EXERCISE_LIBRARY, ...custom.map(c => c.name)])),
)

export const selectWorkoutWeekNumber = createSelector(
  selectWorkoutSessions,
  selectBodySettings,
  (sessions, settings) => {
    const anchor = settings.workoutWeekAnchor
      ?? (sessions.length > 0 ? sessions.reduce((min, s) => s.date < min ? s.date : min, sessions[0].date) : null)
    if (!anchor) return 1
    const diffDays = Math.floor((new Date(todayISO()).getTime() - new Date(anchor).getTime()) / 86400000)
    return Math.max(1, Math.floor(diffDays / 7) + 1)
  },
)

export const selectTodayFood = createSelector(
  selectFoodEntries,
  entries => entries.filter(e => e.date === todayISO()),
)

export const selectAllFood = selectFoodEntries

export const selectTodayKcal = createSelector(
  selectTodayFood,
  entries => entries.reduce((s, e) => s + e.kcal, 0),
)

export const selectTodayProtein = createSelector(
  selectTodayFood,
  entries => entries.reduce((s, e) => s + e.protein, 0),
)

export const selectAllWeight = createSelector(
  selectWeightEntries,
  entries => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
)

export const selectTodayWeight = createSelector(
  selectWeightEntries,
  entries => entries.find(e => e.date === todayISO()) ?? null,
)

export const selectLatestWeight = createSelector(
  selectWeightEntries,
  entries => [...entries].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
)

export const selectStartWeight = createSelector(
  selectWeightEntries,
  entries => [...entries].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null,
)

export const selectLowestWeight = createSelector(
  selectWeightEntries,
  entries => entries.length === 0 ? null : entries.reduce((min, e) => e.weight < min.weight ? e : min),
)

export const select7DayAvgWeight = createSelector(
  selectWeightEntries,
  entries => {
    const cutoff = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
    const recent = entries.filter(e => e.date >= cutoff)
    if (recent.length === 0) return null
    return recent.reduce((s, e) => s + e.weight, 0) / recent.length
  },
)

export const selectWeightChangeThisWeek = createSelector(
  selectWeightEntries,
  entries => {
    const cutoff = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
    const sorted = [...entries].filter(e => e.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date))
    if (sorted.length < 2) return null
    return sorted[sorted.length - 1].weight - sorted[0].weight
  },
)

export const selectCalorieStatus = createSelector(
  selectTodayKcal,
  selectBodySettings,
  (consumed, settings): 'safe' | 'warning' | 'over' => {
    const target = settings.calorieTarget
    if (consumed <= target * 0.9) return 'safe'
    if (consumed <= target) return 'warning'
    return 'over'
  },
)

export const selectLast7DayCalories = createSelector(
  selectFoodEntries,
  entries => {
    const result: { date: string; kcal: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const kcal = entries.filter(e => e.date === d).reduce((s, e) => s + e.kcal, 0)
      result.push({ date: d, kcal })
    }
    return result
  },
)

export const selectAvg7DayKcal = createSelector(
  selectLast7DayCalories,
  days => {
    const logged = days.filter(d => d.kcal > 0)
    if (logged.length === 0) return null
    return Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length)
  },
)

export const selectAvg7DayProtein = createSelector(
  selectFoodEntries,
  entries => {
    const result: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const protein = entries.filter(e => e.date === d).reduce((s, e) => s + e.protein, 0)
      if (protein > 0) result.push(protein)
    }
    if (result.length === 0) return null
    return Math.round(result.reduce((s, v) => s + v, 0) / result.length)
  },
)

export const selectLast14DayWeight = createSelector(
  selectWeightEntries,
  entries => {
    const result: { date: string; weight: number | null; avg: number | null }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const entry = entries.find(e => e.date === d)
      result.push({ date: d, weight: entry?.weight ?? null, avg: null })
    }
    for (let i = 6; i < result.length; i++) {
      const window = result.slice(i - 6, i + 1).map(r => r.weight).filter((w): w is number => w !== null)
      result[i].avg = window.length > 0 ? window.reduce((s, w) => s + w, 0) / window.length : null
    }
    return result
  },
)
