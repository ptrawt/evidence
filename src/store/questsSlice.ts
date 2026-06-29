import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { nanoid } from '@reduxjs/toolkit'
import type { Quest, DailyCompletion } from '../types/quest'
import {
  fetchQuests, seedDefaultQuests, insertQuest, removeQuest,
  fetchCompletions, fetchCompletionsRange, insertCompletion, removeCompletion,
} from '../lib/db/quests'

// Quests
export const loadQuests = createAsyncThunk('quests/load', async (userId: string) => {
  const quests = await fetchQuests(userId)
  if (quests.length === 0) return seedDefaultQuests(userId)
  return quests
})

export const addQuestAsync = createAsyncThunk(
  'quests/add',
  async ({ userId, quest }: { userId: string; quest: Quest }) => {
    await insertQuest(userId, quest)
    return quest
  },
)

export const deleteQuestAsync = createAsyncThunk(
  'quests/delete',
  async (id: string) => { await removeQuest(id); return id },
)

// Completions (today only)
export const loadCompletions = createAsyncThunk(
  'quests/loadCompletions',
  ({ userId, date }: { userId: string; date: string }) => fetchCompletions(userId, date),
)

// Completions for the current week (Mon → today)
export const loadWeekCompletions = createAsyncThunk(
  'quests/loadWeekCompletions',
  ({ userId, from, to }: { userId: string; from: string; to: string }) =>
    fetchCompletionsRange(userId, from, to),
)

export const completeQuest = createAsyncThunk(
  'quests/complete',
  async ({ userId, questId, date }: { userId: string; questId: string; date: string }) => {
    const c: DailyCompletion = { id: nanoid(), questId, date, createdAt: new Date().toISOString() }
    await insertCompletion(userId, c)
    return c
  },
)

export const uncompleteQuest = createAsyncThunk(
  'quests/uncomplete',
  async ({ completionId }: { completionId: string; questId: string }) => {
    await removeCompletion(completionId)
    return completionId
  },
)

interface QuestsState {
  quests: Quest[]
  completions: DailyCompletion[]
  weekCompletions: DailyCompletion[]
  status: 'idle' | 'loading' | 'ready'
}

const questsSlice = createSlice({
  name: 'quests',
  initialState: { quests: [], completions: [], weekCompletions: [], status: 'idle' } as QuestsState,
  reducers: {
    clearQuests(state) { state.quests = []; state.completions = []; state.weekCompletions = []; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(loadQuests.pending, state => { state.status = 'loading' })
      .addCase(loadQuests.fulfilled, (state, action) => {
        state.quests = action.payload
        state.status = 'ready'
      })
      .addCase(loadCompletions.fulfilled, (state, action) => {
        state.completions = action.payload
      })
      .addCase(loadWeekCompletions.fulfilled, (state, action) => {
        state.weekCompletions = action.payload
      })
      // optimistic complete
      .addCase(completeQuest.pending, (state, action) => {
        const { questId, date } = action.meta.arg
        state.completions.push({ id: `pending-${questId}`, questId, date, createdAt: new Date().toISOString() })
      })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.completions = state.completions.filter(c => c.id !== `pending-${action.payload.questId}`)
        state.completions.push(action.payload)
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.completions = state.completions.filter(c => c.id !== `pending-${action.meta.arg.questId}`)
      })
      // optimistic uncomplete
      .addCase(uncompleteQuest.pending, (state, action) => {
        state.completions = state.completions.filter(c => c.id !== action.meta.arg.completionId)
      })
      .addCase(addQuestAsync.pending, (state, action) => { state.quests.push(action.meta.arg.quest) })
      .addCase(addQuestAsync.rejected, (state, action) => {
        state.quests = state.quests.filter(q => q.id !== action.meta.arg.quest.id)
      })
      .addCase(deleteQuestAsync.pending, (state, action) => {
        state.quests = state.quests.filter(q => q.id !== action.meta.arg)
      })
  },
})

export const { clearQuests } = questsSlice.actions
export default questsSlice.reducer
