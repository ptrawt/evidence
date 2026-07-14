import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutSession, LoggedExercise, LoggedSet } from '../lib/db/workout'
import { fetchWorkoutSessions, insertWorkoutSession, removeWorkoutSession } from '../lib/db/workout'

export const loadWorkoutSessions = createAsyncThunk('workout/load', async (userId: string) => {
  return fetchWorkoutSessions(userId)
})

export const finishWorkoutAsync = createAsyncThunk(
  'workout/finish',
  async ({ userId, session }: { userId: string; session: WorkoutSession }) => {
    await insertWorkoutSession(userId, session)
    return session
  },
)

export const deleteWorkoutSessionAsync = createAsyncThunk(
  'workout/delete',
  async (id: string) => {
    await removeWorkoutSession(id)
    return id
  },
)

interface ActiveWorkout {
  startedAt: string
  exercises: LoggedExercise[]
  notes: string
}

interface WorkoutState {
  sessions: WorkoutSession[]
  active: ActiveWorkout | null
  status: 'idle' | 'loading' | 'ready'
}

const emptyExercise = (name: string): LoggedExercise => ({ name, sets: [], notes: '' })

const workoutSlice = createSlice({
  name: 'workout',
  initialState: { sessions: [], active: null, status: 'idle' } as WorkoutState,
  reducers: {
    clearWorkouts(state) { state.sessions = []; state.active = null; state.status = 'idle' },
    startActiveWorkout(state, action: PayloadAction<{ prefillNames?: string[] } | undefined>) {
      state.active = {
        startedAt: new Date().toISOString(),
        exercises: (action.payload?.prefillNames ?? []).map(emptyExercise),
        notes: '',
      }
    },
    cancelActiveWorkout(state) { state.active = null },
    addActiveExercise(state, action: PayloadAction<{ name: string }>) {
      state.active?.exercises.push(emptyExercise(action.payload.name))
    },
    removeActiveExercise(state, action: PayloadAction<{ exerciseIndex: number }>) {
      state.active?.exercises.splice(action.payload.exerciseIndex, 1)
    },
    setActiveExerciseNotes(state, action: PayloadAction<{ exerciseIndex: number; notes: string }>) {
      const ex = state.active?.exercises[action.payload.exerciseIndex]
      if (ex) ex.notes = action.payload.notes
    },
    logActiveSet(state, action: PayloadAction<{ exerciseIndex: number; set: LoggedSet }>) {
      state.active?.exercises[action.payload.exerciseIndex]?.sets.push(action.payload.set)
    },
    removeActiveSet(state, action: PayloadAction<{ exerciseIndex: number; setIndex: number }>) {
      state.active?.exercises[action.payload.exerciseIndex]?.sets.splice(action.payload.setIndex, 1)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadWorkoutSessions.pending, state => { state.status = 'loading' })
      .addCase(loadWorkoutSessions.fulfilled, (state, action) => {
        state.sessions = action.payload; state.status = 'ready'
      })
      .addCase(finishWorkoutAsync.pending, (state, action) => {
        state.sessions.push(action.meta.arg.session)
        state.active = null
      })
      .addCase(finishWorkoutAsync.rejected, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.meta.arg.session.id)
      })
      .addCase(deleteWorkoutSessionAsync.pending, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.meta.arg)
      })
  },
})

export const {
  clearWorkouts, startActiveWorkout, cancelActiveWorkout,
  addActiveExercise, removeActiveExercise, setActiveExerciseNotes,
  logActiveSet, removeActiveSet,
} = workoutSlice.actions
export default workoutSlice.reducer
