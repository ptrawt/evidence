import { supabase } from '../supabase'
import type { WeightEntry } from '../../types/body'

export async function fetchWeight(userId: string): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, date: r.date, weight: Number(r.weight), createdAt: r.created_at,
  }))
}

export async function upsertWeight(userId: string, entry: WeightEntry) {
  const { error } = await supabase.from('weight_entries').upsert({
    id: entry.id, user_id: userId, date: entry.date,
    weight: entry.weight, created_at: entry.createdAt,
  }, { onConflict: 'user_id,date' })
  if (error) throw error
}

export async function removeWeight(id: string) {
  const { error } = await supabase.from('weight_entries').delete().eq('id', id)
  if (error) throw error
}
