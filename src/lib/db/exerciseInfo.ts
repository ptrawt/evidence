import { supabase } from '../supabase'
import type { ExerciseInfo } from '../exerciseInfo'

export type ExerciseInfoMap = Record<string, ExerciseInfo>

export async function fetchExerciseInfo(userId: string): Promise<ExerciseInfoMap> {
  const { data, error } = await supabase
    .from('exercise_info')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return {}
  const result: ExerciseInfoMap = {}
  for (const r of data) {
    result[r.exercise_name] = {
      exerciseName: r.exercise_name,
      category: r.category,
      type: r.type,
      difficulty: r.difficulty,
      priority: r.priority,
      details: r.details ?? {},
    }
  }
  return result
}

export async function upsertExerciseInfo(userId: string, info: ExerciseInfo): Promise<void> {
  const { error } = await supabase
    .from('exercise_info')
    .upsert({
      user_id: userId,
      exercise_name: info.exerciseName,
      category: info.category,
      type: info.type,
      difficulty: info.difficulty,
      priority: info.priority,
      details: info.details,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,exercise_name' })
  if (error) throw error
}

export async function bulkUpsertExerciseInfo(userId: string, infos: ExerciseInfo[]): Promise<void> {
  const { error } = await supabase
    .from('exercise_info')
    .upsert(
      infos.map(info => ({
        user_id: userId,
        exercise_name: info.exerciseName,
        category: info.category,
        type: info.type,
        difficulty: info.difficulty,
        priority: info.priority,
        details: info.details,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,exercise_name' },
    )
  if (error) throw error
}

export async function removeExerciseInfo(userId: string, exerciseName: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_info')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
  if (error) throw error
}
