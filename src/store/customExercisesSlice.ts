import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import type { CustomExercise } from '../lib/db/customExercises'
import { fetchCustomExercises, insertCustomExercises } from '../lib/db/customExercises'
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary'
import type { RootState } from './index'

export const loadCustomExercises = createAsyncThunk(
  'customExercises/load',
  (userId: string) => fetchCustomExercises(userId),
)

function unknownNames(state: RootState, names: string[]): string[] {
  const known = new Set([...EXERCISE_LIBRARY, ...state.customExercises.items.map(i => i.name)])
  return [...new Set(names)].filter(n => n && !known.has(n))
}

// Registers exercise name(s) as custom exercises if they aren't already part of the
// preset library or previously saved — safe to call unconditionally from any call site.
export const registerExercisesIfNewAsync = createAsyncThunk(
  'customExercises/registerIfNew',
  async ({ userId, names }: { userId: string; names: string[] }, { getState }) => {
    const toAdd = unknownNames(getState() as RootState, names)
    const exercises: CustomExercise[] = toAdd.map(name => ({ id: nanoid(), name, createdAt: new Date().toISOString() }))
    await insertCustomExercises(userId, exercises)
    return exercises
  },
)

interface CustomExercisesState {
  items: CustomExercise[]
  status: 'idle' | 'loading' | 'ready'
}

const customExercisesSlice = createSlice({
  name: 'customExercises',
  initialState: { items: [], status: 'idle' } as CustomExercisesState,
  reducers: {
    clearCustomExercises(state) { state.items = []; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(loadCustomExercises.pending, state => { state.status = 'loading' })
      .addCase(loadCustomExercises.fulfilled, (state, action) => {
        state.items = action.payload; state.status = 'ready'
      })
      .addCase(registerExercisesIfNewAsync.fulfilled, (state, action) => {
        state.items.push(...action.payload)
      })
  },
})

export const { clearCustomExercises } = customExercisesSlice.actions
export default customExercisesSlice.reducer
