import { supabase } from '../supabase'

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type WorkoutSplit = Record<WeekDay, string[]>

export const WEEKDAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export const EMPTY_SPLIT: WorkoutSplit = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }

export function todayWeekDay(): WeekDay {
  return WEEKDAYS[(new Date().getDay() + 6) % 7]
}

export async function fetchWorkoutSplit(userId: string): Promise<WorkoutSplit> {
  const { data, error } = await supabase
    .from('workout_splits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return EMPTY_SPLIT
  return { ...EMPTY_SPLIT, ...(data.days ?? {}) } as WorkoutSplit
}

export async function saveWorkoutSplit(userId: string, days: WorkoutSplit): Promise<void> {
  const { error } = await supabase
    .from('workout_splits')
    .upsert({ user_id: userId, days, updated_at: new Date().toISOString() })
  if (error) throw error
}
