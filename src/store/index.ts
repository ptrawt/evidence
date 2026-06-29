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
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
