import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { WeekDay, WorkoutSplit } from '../lib/db/workoutSplit'
import { EMPTY_SPLIT, fetchWorkoutSplit, saveWorkoutSplit } from '../lib/db/workoutSplit'

export const loadWorkoutSplit = createAsyncThunk(
  'workoutSplit/load',
  (userId: string) => fetchWorkoutSplit(userId),
)

export const saveWorkoutSplitAsync = createAsyncThunk(
  'workoutSplit/save',
  async ({ userId, days }: { userId: string; days: WorkoutSplit }) => {
    await saveWorkoutSplit(userId, days)
    return days
  },
)

const workoutSplitSlice = createSlice({
  name: 'workoutSplit',
  initialState: EMPTY_SPLIT,
  reducers: {
    resetWorkoutSplit() {
      return EMPTY_SPLIT
    },
    addSplitExercise(state, action: PayloadAction<{ day: WeekDay; name: string }>) {
      state[action.payload.day].push(action.payload.name)
    },
    removeSplitExercise(state, action: PayloadAction<{ day: WeekDay; index: number }>) {
      state[action.payload.day].splice(action.payload.index, 1)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadWorkoutSplit.fulfilled, (_state, action) => action.payload)
      .addCase(saveWorkoutSplitAsync.pending, (_state, action) => action.meta.arg.days)
  },
})

export const { resetWorkoutSplit, addSplitExercise, removeSplitExercise } = workoutSplitSlice.actions
export default workoutSplitSlice.reducer
