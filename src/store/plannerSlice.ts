import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { PlanItem } from '../lib/db/planner'
import { fetchPlanItems, insertPlanItem, updatePlanItem, removePlanItem } from '../lib/db/planner'

export const loadPlanItems = createAsyncThunk('planner/load', async (userId: string) => {
  return fetchPlanItems(userId)
})

export const addPlanItemAsync = createAsyncThunk(
  'planner/add',
  async ({ userId, item }: { userId: string; item: PlanItem }) => {
    await insertPlanItem(userId, item)
    return item
  },
)

export const togglePlanItemAsync = createAsyncThunk(
  'planner/toggle',
  async ({ id, completed }: { id: string; completed: boolean }) => {
    await updatePlanItem(id, { completed })
    return { id, completed }
  },
)

export const deletePlanItemAsync = createAsyncThunk(
  'planner/delete',
  async (id: string) => {
    await removePlanItem(id)
    return id
  },
)

interface PlannerState {
  items: PlanItem[]
  status: 'idle' | 'loading' | 'ready'
}

const plannerSlice = createSlice({
  name: 'planner',
  initialState: { items: [], status: 'idle' } as PlannerState,
  reducers: {
    clearPlanner(state) { state.items = []; state.status = 'idle' },
    patchItem(state, action: PayloadAction<{ id: string } & Partial<PlanItem>>) {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) Object.assign(item, action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadPlanItems.pending, state => { state.status = 'loading' })
      .addCase(loadPlanItems.fulfilled, (state, action) => {
        state.items = action.payload; state.status = 'ready'
      })
      .addCase(addPlanItemAsync.pending, (state, action) => {
        state.items.push(action.meta.arg.item)
      })
      .addCase(addPlanItemAsync.rejected, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.meta.arg.item.id)
      })
      .addCase(togglePlanItemAsync.pending, (state, action) => {
        const item = state.items.find(i => i.id === action.meta.arg.id)
        if (item) item.completed = action.meta.arg.completed
      })
      .addCase(togglePlanItemAsync.rejected, (state, action) => {
        const item = state.items.find(i => i.id === action.meta.arg.id)
        if (item) item.completed = !action.meta.arg.completed
      })
      .addCase(deletePlanItemAsync.pending, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.meta.arg)
      })
  },
})

export const { clearPlanner, patchItem } = plannerSlice.actions
export default plannerSlice.reducer
