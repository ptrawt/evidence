import { supabase } from '../supabase'
import type { Pillar } from '../../types'

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weightKg?: number
  videoUrl?: string
}

export interface PlanItem {
  id: string
  date: string
  pillar: Pillar
  title: string
  type: 'task' | 'workout'
  completed: boolean
  notes: string
  exercises: Exercise[]
  createdAt: string
}

export async function fetchPlanItems(userId: string): Promise<PlanItem[]> {
  const { data, error } = await supabase
    .from('plan_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map(r => ({
    id: r.id, date: r.date,
    pillar: r.pillar as Pillar,
    title: r.title, type: r.type as 'task' | 'workout',
    completed: r.completed, notes: r.notes,
    exercises: (r.exercises ?? []) as Exercise[],
    createdAt: r.created_at,
  }))
}

export async function insertPlanItem(userId: string, item: PlanItem): Promise<void> {
  const { error } = await supabase.from('plan_items').insert({
    id: item.id, user_id: userId, date: item.date,
    pillar: item.pillar, title: item.title, type: item.type,
    completed: item.completed, notes: item.notes,
    exercises: item.exercises, created_at: item.createdAt,
  })
  if (error) throw error
}

export async function updatePlanItem(id: string, patch: { completed?: boolean; title?: string; notes?: string; exercises?: Exercise[] }): Promise<void> {
  const { error } = await supabase.from('plan_items').update(patch).eq('id', id)
  if (error) throw error
}

export async function removePlanItem(id: string): Promise<void> {
  const { error } = await supabase.from('plan_items').delete().eq('id', id)
  if (error) throw error
}
