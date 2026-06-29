import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { KnowledgeEntry } from '../lib/db/knowledge'
import { fetchKnowledgeEntries, insertKnowledgeEntry, removeKnowledgeEntry } from '../lib/db/knowledge'

export const loadKnowledge = createAsyncThunk('knowledge/load', async (userId: string) => {
  return fetchKnowledgeEntries(userId)
})

export const addKnowledgeAsync = createAsyncThunk(
  'knowledge/add',
  async ({ userId, entry }: { userId: string; entry: KnowledgeEntry }) => {
    await insertKnowledgeEntry(userId, entry)
    return entry
  },
)

export const deleteKnowledgeAsync = createAsyncThunk(
  'knowledge/delete',
  async (id: string) => {
    await removeKnowledgeEntry(id)
    return id
  },
)

interface KnowledgeState {
  entries: KnowledgeEntry[]
  status: 'idle' | 'loading' | 'ready'
}

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState: { entries: [], status: 'idle' } as KnowledgeState,
  reducers: {
    clearKnowledge(state) { state.entries = []; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(loadKnowledge.pending, state => { state.status = 'loading' })
      .addCase(loadKnowledge.fulfilled, (state, action) => {
        state.entries = action.payload; state.status = 'ready'
      })
      .addCase(addKnowledgeAsync.pending, (state, action) => {
        state.entries.unshift(action.meta.arg.entry)
      })
      .addCase(addKnowledgeAsync.rejected, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg.entry.id)
      })
      .addCase(deleteKnowledgeAsync.pending, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.meta.arg)
      })
  },
})

export const { clearKnowledge } = knowledgeSlice.actions
export default knowledgeSlice.reducer
