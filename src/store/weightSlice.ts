import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { WeightEntry } from '../types/body'
import { fetchWeight, upsertWeight, removeWeight } from '../lib/db/weight'

export const loadWeight = createAsyncThunk('weight/load', (userId: string) => fetchWeight(userId))

export const addWeightAsync = createAsyncThunk(
  'weight/add',
  async ({ userId, entry }: { userId: string; entry: WeightEntry }) => {
    await upsertWeight(userId, entry)
    return entry
  },
)

export const deleteWeightAsync = createAsyncThunk(
  'weight/delete',
  async (id: string) => {
    await removeWeight(id)
    return id
  },
)

interface WeightState { entries: WeightEntry[] }

const weightSlice = createSlice({
  name: 'weight',
  initialState: { entries: [] } as WeightState,
  reducers: {
    addWeight(state, action: PayloadAction<WeightEntry>) {
      state.entries = state.entries.filter(e => e.date !== action.payload.date)
      state.entries.unshift(action.payload)
    },
    deleteWeight(state, action: PayloadAction<string>) { state.entries = state.entries.filter(e => e.id !== action.payload) },
    clearWeight(state) { state.entries = [] },
  },
  extraReducers: builder => {
    builder
      .addCase(loadWeight.fulfilled, (state, action) => { state.entries = action.payload })
      .addCase(addWeightAsync.pending, (state, action) => {
        const entry = action.meta.arg.entry
        state.entries = state.entries.filter(e => e.date !== entry.date)
        state.entries.unshift(entry)
      })
      .addCase(addWeightAsync.rejected, (state, action) => { state.entries = state.entries.filter(e => e.id !== action.meta.arg.entry.id) })
      .addCase(deleteWeightAsync.pending, (state, action) => { state.entries = state.entries.filter(e => e.id !== action.meta.arg) })
  },
})

export const { addWeight, deleteWeight, clearWeight } = weightSlice.actions
export default weightSlice.reducer
