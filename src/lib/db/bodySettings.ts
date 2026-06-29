import { supabase } from '../supabase'
import type { BodySettings } from '../../types/body'

export async function fetchBodySettings(userId: string): Promise<BodySettings | null> {
  const { data, error } = await supabase
    .from('body_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return {
    calorieTarget: data.calorie_target,
    proteinTarget: data.protein_target,
    strictMode: data.strict_mode,
    weightGoal: data.weight_goal ?? undefined,
  }
}

export async function upsertBodySettings(userId: string, settings: BodySettings) {
  const { error } = await supabase.from('body_settings').upsert({
    user_id: userId,
    calorie_target: settings.calorieTarget,
    protein_target: settings.proteinTarget,
    strict_mode: settings.strictMode,
    weight_goal: settings.weightGoal ?? null,
  }, { onConflict: 'user_id' })
  if (error) throw error
}
