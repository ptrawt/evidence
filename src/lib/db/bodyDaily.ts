import { supabase } from '../supabase'

export interface BodyDaily {
  id: string
  date: string
  waterMl: number
  sleepHours: number
  ifStart: string
  ifEnd: string
  ifDone: boolean
  mood: number
  energy: number
  createdAt: string
}

export async function fetchBodyDaily(userId: string, date: string): Promise<BodyDaily | null> {
  const { data, error } = await supabase
    .from('body_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  if (error) return null
  return {
    id: data.id, date: data.date,
    waterMl: data.water_ml, sleepHours: Number(data.sleep_hours),
    ifStart: data.if_start, ifEnd: data.if_end,
    ifDone: data.if_done,
    mood: data.mood ?? 0, energy: data.energy ?? 0,
    createdAt: data.created_at,
  }
}

export async function upsertBodyDaily(userId: string, record: BodyDaily): Promise<void> {
  const { error } = await supabase.from('body_daily').upsert({
    id: record.id, user_id: userId, date: record.date,
    water_ml: record.waterMl, sleep_hours: record.sleepHours,
    if_start: record.ifStart, if_end: record.ifEnd,
    if_done: record.ifDone,
    mood: record.mood, energy: record.energy,
    created_at: record.createdAt,
  }, { onConflict: 'user_id,date' })
  if (error) throw error
}
