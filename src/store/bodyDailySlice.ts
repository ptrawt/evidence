import { createSlice, createAsyncThunk, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { BodyDaily } from '../lib/db/bodyDaily'
import { fetchBodyDaily, upsertBodyDaily } from '../lib/db/bodyDaily'
import { todayISO } from '../lib/constants'

const emptyRecord = (): BodyDaily => ({
  id: nanoid(), date: todayISO(),
  waterMl: 0, sleepHours: 0,
  ifStart: '', ifEnd: '', ifDone: false,
  mood: 0, energy: 0,
  createdAt: new Date().toISOString(),
})

export const loadBodyDaily = createAsyncThunk(
  'bodyDaily/load',
  async ({ userId, date }: { userId: string; date: string }) => {
    const data = await fetchBodyDaily(userId, date)
    return data ?? { ...emptyRecord(), date }
  },
)

export const saveBodyDaily = createAsyncThunk(
  'bodyDaily/save',
  async ({ userId, record }: { userId: string; record: BodyDaily }) => {
    await upsertBodyDaily(userId, record)
    return record
  },
)

const bodyDailySlice = createSlice({
  name: 'bodyDaily',
  initialState: emptyRecord() as BodyDaily,
  reducers: {
    patchBodyDaily(state, action: PayloadAction<Partial<BodyDaily>>) {
      Object.assign(state, action.payload)
    },
    resetBodyDaily() {
      return emptyRecord()
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadBodyDaily.fulfilled, (_, action) => action.payload)
      .addCase(saveBodyDaily.fulfilled, (_, action) => action.payload)
  },
})

export const { patchBodyDaily, resetBodyDaily } = bodyDailySlice.actions
export default bodyDailySlice.reducer
