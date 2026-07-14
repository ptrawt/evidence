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
import workoutReducer from './workoutSlice'
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
