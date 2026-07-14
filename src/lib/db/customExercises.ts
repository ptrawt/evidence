import { supabase } from '../supabase'

export interface CustomExercise {
  id: string
  name: string
  createdAt: string
}

export async function fetchCustomExercises(userId: string): Promise<CustomExercise[]> {
  const { data, error } = await supabase
    .from('custom_exercises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map(r => ({ id: r.id, name: r.name, createdAt: r.created_at }))
}

export async function insertCustomExercises(userId: string, exercises: CustomExercise[]): Promise<void> {
  if (exercises.length === 0) return
  const { error } = await supabase
    .from('custom_exercises')
    .upsert(
      exercises.map(e => ({ id: e.id, user_id: userId, name: e.name, created_at: e.createdAt })),
      { onConflict: 'user_id,name', ignoreDuplicates: true },
    )
  if (error) throw error
}
