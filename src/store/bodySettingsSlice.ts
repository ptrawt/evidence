import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { BodySettings } from '../types/body'
import { DEFAULT_BODY_SETTINGS } from '../types/body'
import { fetchBodySettings, upsertBodySettings } from '../lib/db/bodySettings'

export const loadBodySettings = createAsyncThunk(
  'bodySettings/load',
  (userId: string) => fetchBodySettings(userId),
)

export const saveBodySettings = createAsyncThunk(
  'bodySettings/save',
  async ({ userId, settings }: { userId: string; settings: BodySettings }) => {
    await upsertBodySettings(userId, settings)
    return settings
  },
)

const bodySettingsSlice = createSlice({
  name: 'bodySettings',
  initialState: DEFAULT_BODY_SETTINGS,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<BodySettings>>) {
      Object.assign(state, action.payload)
    },
    toggleStrictMode(state) {
      state.strictMode = !state.strictMode
    },
    resetBodySettings() {
      return DEFAULT_BODY_SETTINGS
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadBodySettings.fulfilled, (state, action) => {
        if (action.payload) Object.assign(state, action.payload)
      })
      .addCase(saveBodySettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload)
      })
  },
})

export const { updateSettings, toggleStrictMode, resetBodySettings } = bodySettingsSlice.actions
export default bodySettingsSlice.reducer
