import { configureStore } from '@reduxjs/toolkit'
import evidenceReducer from './evidenceSlice'
import foodReducer from './foodSlice'
import weightReducer from './weightSlice'
import bodySettingsReducer from './bodySettingsSlice'
import questsReducer from './questsSlice'
import bodyDailyReducer from './bodyDailySlice'
import moneyReducer from './moneySlice'
import knowledgeReducer from './knowledgeSlice'
import plannerReducer from './plannerSlice'
import photosReducer from './photosSlice'
import workoutReducer, { restoreActiveWorkout, type ActiveWorkout } from './workoutSlice'
import workoutSplitReducer from './workoutSplitSlice'
import customExercisesReducer from './customExercisesSlice'
import exerciseTargetsReducer from './exerciseTargetsSlice'
import exerciseInfoReducer from './exerciseInfoSlice'

export const store = configureStore({
  reducer: {
    evidence: evidenceReducer,
    food: foodReducer,
    weight: weightReducer,
    bodySettings: bodySettingsReducer,
    quests: questsReducer,
    bodyDaily: bodyDailyReducer,
    money: moneyReducer,
    knowledge: knowledgeReducer,
    planner: plannerReducer,
    photos: photosReducer,
    workout: workoutReducer,
    workoutSplit: workoutSplitReducer,
    customExercises: customExercisesReducer,
    exerciseTargets: exerciseTargetsReducer,
    exerciseInfo: exerciseInfoReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Persist the in-progress workout to localStorage so an accidental tab close or
// reload mid-workout doesn't wipe everything the user already logged — active
// workout state otherwise lives only in memory.
const ACTIVE_WORKOUT_KEY = 'evidence_active_workout'

try {
  const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY)
  if (saved) store.dispatch(restoreActiveWorkout(JSON.parse(saved) as ActiveWorkout))
} catch {
  localStorage.removeItem(ACTIVE_WORKOUT_KEY)
}

let lastPersistedActiveWorkout: string | null = null
store.subscribe(() => {
  const active = store.getState().workout.active
  const serialized = active ? JSON.stringify(active) : null
  if (serialized === lastPersistedActiveWorkout) return
  lastPersistedActiveWorkout = serialized
  if (serialized) localStorage.setItem(ACTIVE_WORKOUT_KEY, serialized)
  else localStorage.removeItem(ACTIVE_WORKOUT_KEY)
})
