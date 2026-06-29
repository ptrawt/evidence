import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { EvidenceEntry } from '../types'
import { fetchEvidence, insertEvidence, removeEvidence } from '../lib/db/evidence'

export const loadEvidence = createAsyncThunk(
  'evidence/load',
  (userId: string) => fetchEvidence(userId),
)

export const addEvidenceAsync = createAsyncThunk(
  'evidence/add',
  async ({ userId, entry }: { userId: string; entry: EvidenceEntry }) => {
    await insertEvidence(userId, entry)
    return entry
  },
)

export const deleteEvidenceAsync = createAsyncThunk(
  'evidence/delete',
  async (id: string) => {
    await removeEvidence(id)
    return id
  },
)

interface EvidenceState {
  entries: EvidenceEntry[]
  status: 'idle' | 'loading' | 'ready'
}

const evidenceSlice = createSlice({
  name: 'evidence',
  initialState: { entries: [], status: 'idle' } as EvidenceState,
  reducers: {
    addEvidence(state, action: PayloadAction<EvidenceEntry>) {
      state.entries.unshift(action.payload)
    },
    deleteEvidence(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.id !== action.payload)
    },
    clearEvidence(state) {
      state.entries = []
      state.status = 'idle'
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadEvidence.fulfilled, (state, action) => {
        state.entries = action.payload
        state.status = 'ready'
      })
      .addCase(addEvidenceAsync.pending, (state, action) => {
        state.entries.unshift(action.meta.arg.entry)
      })
      .addCase(addEvidenceAsync.rejected, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg.entry.id)
      })
      .addCase(deleteEvidenceAsync.pending, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg)
      })
  },
})

export const { addEvidence, deleteEvidence, clearEvidence } = evidenceSlice.actions
export default evidenceSlice.reducer
