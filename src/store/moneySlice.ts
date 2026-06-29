import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MoneyEntry } from '../lib/db/money'
import { fetchMoneyEntries, insertMoneyEntry, removeMoneyEntry } from '../lib/db/money'

export const loadMoney = createAsyncThunk('money/load', async (userId: string) => {
  return fetchMoneyEntries(userId)
})

export const addMoneyAsync = createAsyncThunk(
  'money/add',
  async ({ userId, entry }: { userId: string; entry: MoneyEntry }) => {
    await insertMoneyEntry(userId, entry)
    return entry
  },
)

export const deleteMoneyAsync = createAsyncThunk(
  'money/delete',
  async (id: string) => {
    await removeMoneyEntry(id)
    return id
  },
)

interface MoneyState {
  entries: MoneyEntry[]
  status: 'idle' | 'loading' | 'ready'
}

const moneySlice = createSlice({
  name: 'money',
  initialState: { entries: [], status: 'idle' } as MoneyState,
  reducers: {
    clearMoney(state) { state.entries = []; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(loadMoney.pending, state => { state.status = 'loading' })
      .addCase(loadMoney.fulfilled, (state, action) => {
        state.entries = action.payload; state.status = 'ready'
      })
      .addCase(addMoneyAsync.pending, (state, action) => {
        state.entries.unshift(action.meta.arg.entry)
      })
      .addCase(addMoneyAsync.rejected, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg.entry.id)
      })
      .addCase(deleteMoneyAsync.pending, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg)
      })
  },
})

export const { clearMoney } = moneySlice.actions
export default moneySlice.reducer
