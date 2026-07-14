import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ExerciseTarget } from '../lib/progressiveOverload'
import type { ExerciseTargets } from '../lib/db/exerciseTargets'
import { fetchExerciseTargets, upsertExerciseTarget } from '../lib/db/exerciseTargets'

export const loadExerciseTargets = createAsyncThunk(
  'exerciseTargets/load',
  (userId: string) => fetchExerciseTargets(userId),
)

export const saveExerciseTargetAsync = createAsyncThunk(
  'exerciseTargets/save',
  async ({ userId, exerciseName, target }: { userId: string; exerciseName: string; target: ExerciseTarget }) => {
    await upsertExerciseTarget(userId, exerciseName, target)
    return { exerciseName, target }
  },
)

const exerciseTargetsSlice = createSlice({
  name: 'exerciseTargets',
  initialState: {} as ExerciseTargets,
  reducers: {
    clearExerciseTargets() {
      return {}
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadExerciseTargets.fulfilled, (_state, action) => action.payload)
      .addCase(saveExerciseTargetAsync.pending, (state, action) => {
        state[action.meta.arg.exerciseName] = action.meta.arg.target
      })
  },
})

export const { clearExerciseTargets } = exerciseTargetsSlice.actions
export default exerciseTargetsSlice.reducer
