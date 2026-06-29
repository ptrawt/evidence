import { supabase } from '../supabase'
import type { FoodEntry } from '../../types/body'

export async function fetchFood(userId: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, date: r.date, meal: r.meal as FoodEntry['meal'],
    name: r.name, kcal: r.kcal, protein: r.protein,
    note: r.note, createdAt: r.created_at,
  }))
}

export async function insertFood(userId: string, entry: FoodEntry) {
  const { error } = await supabase.from('food_entries').insert({
    id: entry.id, user_id: userId, date: entry.date, meal: entry.meal,
    name: entry.name, kcal: entry.kcal, protein: entry.protein,
    note: entry.note, created_at: entry.createdAt,
  })
  if (error) throw error
}

export async function removeFood(id: string) {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw error
}
