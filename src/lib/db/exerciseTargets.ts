import { supabase } from '../supabase'
import type { ExerciseTarget } from '../progressiveOverload'

export type ExerciseTargets = Record<string, ExerciseTarget>

export async function fetchExerciseTargets(userId: string): Promise<ExerciseTargets> {
  const { data, error } = await supabase
    .from('exercise_targets')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return {}
  const result: ExerciseTargets = {}
  for (const r of data) {
    result[r.exercise_name] = { repMin: r.rep_min, repMax: r.rep_max, targetRpe: r.target_rpe }
  }
  return result
}

export async function upsertExerciseTarget(userId: string, exerciseName: string, target: ExerciseTarget): Promise<void> {
  const { error } = await supabase
    .from('exercise_targets')
    .upsert({
      user_id: userId, exercise_name: exerciseName,
      rep_min: target.repMin, rep_max: target.repMax, target_rpe: target.targetRpe,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,exercise_name' })
  if (error) throw error
}
