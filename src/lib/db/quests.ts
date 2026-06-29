import { nanoid } from '@reduxjs/toolkit'
import { supabase } from '../supabase'
import type { Quest, DailyCompletion } from '../../types/quest'
import { DEFAULT_QUESTS } from '../../types/quest'

export async function fetchQuests(userId: string): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, pillar: r.pillar, name: r.name, xp: r.xp,
    isPreset: r.is_preset, sortOrder: r.sort_order, createdAt: r.created_at,
  }))
}

export async function seedDefaultQuests(userId: string): Promise<Quest[]> {
  const now = new Date().toISOString()
  const rows = DEFAULT_QUESTS.map((q, i) => ({
    id: nanoid(),
    user_id: userId,
    pillar: q.pillar,
    name: q.name,
    xp: q.xp,
    is_preset: q.isPreset,
    sort_order: i,
    created_at: now,
  }))
  const { data, error } = await supabase.from('quests').insert(rows).select()
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, pillar: r.pillar, name: r.name, xp: r.xp,
    isPreset: r.is_preset, sortOrder: r.sort_order, createdAt: r.created_at,
  }))
}

export async function insertQuest(userId: string, quest: Quest): Promise<void> {
  const { error } = await supabase.from('quests').insert({
    id: quest.id, user_id: userId, pillar: quest.pillar, name: quest.name,
    xp: quest.xp, is_preset: quest.isPreset, sort_order: quest.sortOrder,
    created_at: quest.createdAt,
  })
  if (error) throw error
}

export async function removeQuest(id: string): Promise<void> {
  const { error } = await supabase.from('quests').delete().eq('id', id)
  if (error) throw error
}

export async function fetchCompletions(userId: string, date: string): Promise<DailyCompletion[]> {
  const { data, error } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, questId: r.quest_id, date: r.date, createdAt: r.created_at,
  }))
}

export async function fetchCompletionsRange(userId: string, from: string, to: string): Promise<DailyCompletion[]> {
  const { data, error } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, questId: r.quest_id, date: r.date, createdAt: r.created_at,
  }))
}

export async function insertCompletion(userId: string, c: DailyCompletion): Promise<void> {
  const { error } = await supabase.from('daily_completions').insert({
    id: c.id, user_id: userId, quest_id: c.questId, date: c.date, created_at: c.createdAt,
  })
  if (error) throw error
}

export async function removeCompletion(id: string): Promise<void> {
  const { error } = await supabase.from('daily_completions').delete().eq('id', id)
  if (error) throw error
}
