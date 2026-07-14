import { supabase } from '../supabase'

export interface LoggedSet {
  reps: number
  weightKg?: number
  rpe?: number
}

export interface LoggedExercise {
  name: string
  sets: LoggedSet[]
  notes: string
}

export interface WorkoutSession {
  id: string
  date: string
  startedAt: string
  finishedAt: string
  exercises: LoggedExercise[]
  notes: string
  xp: number
  createdAt: string
}

export async function fetchWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map(r => ({
    id: r.id, date: r.date,
    startedAt: r.started_at, finishedAt: r.finished_at,
    exercises: (r.exercises ?? []) as LoggedExercise[],
    notes: r.notes, xp: r.xp,
    createdAt: r.created_at,
  }))
}

export async function insertWorkoutSession(userId: string, session: WorkoutSession): Promise<void> {
  const { error } = await supabase.from('workout_sessions').insert({
    id: session.id, user_id: userId, date: session.date,
    started_at: session.startedAt, finished_at: session.finishedAt,
    exercises: session.exercises, notes: session.notes, xp: session.xp,
    created_at: session.createdAt,
  })
  if (error) throw error
}

export async function removeWorkoutSession(id: string): Promise<void> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) throw error
}
