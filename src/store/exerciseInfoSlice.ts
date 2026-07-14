import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ExerciseInfo } from '../lib/exerciseInfo'
import type { ExerciseInfoMap } from '../lib/db/exerciseInfo'
import { fetchExerciseInfo, upsertExerciseInfo, bulkUpsertExerciseInfo, removeExerciseInfo } from '../lib/db/exerciseInfo'

export const loadExerciseInfo = createAsyncThunk(
  'exerciseInfo/load',
  (userId: string) => fetchExerciseInfo(userId),
)

export const saveExerciseInfoAsync = createAsyncThunk(
  'exerciseInfo/save',
  async ({ userId, info }: { userId: string; info: ExerciseInfo }) => {
    await upsertExerciseInfo(userId, info)
    return info
  },
)

export const importExerciseInfoAsync = createAsyncThunk(
  'exerciseInfo/import',
  async ({ userId, infos }: { userId: string; infos: ExerciseInfo[] }) => {
    await bulkUpsertExerciseInfo(userId, infos)
    return infos
  },
)

export const deleteExerciseInfoAsync = createAsyncThunk(
  'exerciseInfo/delete',
  async ({ userId, exerciseName }: { userId: string; exerciseName: string }) => {
    await removeExerciseInfo(userId, exerciseName)
    return exerciseName
  },
)

const exerciseInfoSlice = createSlice({
  name: 'exerciseInfo',
  initialState: {} as ExerciseInfoMap,
  reducers: {
    clearExerciseInfo() {
      return {}
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadExerciseInfo.fulfilled, (_state, action) => action.payload)
      .addCase(saveExerciseInfoAsync.pending, (state, action) => {
        state[action.meta.arg.info.exerciseName] = action.meta.arg.info
      })
      .addCase(importExerciseInfoAsync.pending, (state, action) => {
        for (const info of action.meta.arg.infos) state[info.exerciseName] = info
      })
      .addCase(deleteExerciseInfoAsync.pending, (state, action) => {
        delete state[action.meta.arg.exerciseName]
      })
  },
})

export const { clearExerciseInfo } = exerciseInfoSlice.actions
export default exerciseInfoSlice.reducer
