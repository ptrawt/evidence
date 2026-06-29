import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { FoodEntry } from '../types/body'
import { fetchFood, insertFood, removeFood } from '../lib/db/food'

export const loadFood = createAsyncThunk('food/load', (userId: string) => fetchFood(userId))

export const addFoodAsync = createAsyncThunk(
  'food/add',
  async ({ userId, entry }: { userId: string; entry: FoodEntry }) => {
    await insertFood(userId, entry)
    return entry
  },
)

export const deleteFoodAsync = createAsyncThunk(
  'food/delete',
  async (id: string) => {
    await removeFood(id)
    return id
  },
)

interface FoodState { entries: FoodEntry[] }

const foodSlice = createSlice({
  name: 'food',
  initialState: { entries: [] } as FoodState,
  reducers: {
    addFood(state, action: PayloadAction<FoodEntry>) { state.entries.unshift(action.payload) },
    deleteFood(state, action: PayloadAction<string>) { state.entries = state.entries.filter(e => e.id !== action.payload) },
    clearFood(state) { state.entries = [] },
  },
  extraReducers: builder => {
    builder
      .addCase(loadFood.fulfilled, (state, action) => { state.entries = action.payload })
      .addCase(addFoodAsync.pending, (state, action) => { state.entries.unshift(action.meta.arg.entry) })
      .addCase(addFoodAsync.rejected, (state, action) => { state.entries = state.entries.filter(e => e.id !== action.meta.arg.entry.id) })
      .addCase(deleteFoodAsync.pending, (state, action) => { state.entries = state.entries.filter(e => e.id !== action.meta.arg) })
  },
})

export const { addFood, deleteFood, clearFood } = foodSlice.actions
export default foodSlice.reducer
