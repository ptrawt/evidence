import type { WorkoutSession, LoggedExercise } from './db/workout'

export interface WorkoutStats {
  exerciseCount: number
  setCount: number
  totalVolume: number
  durationMinutes: number
}

export function exerciseVolume(exercise: LoggedExercise): number {
  return exercise.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * s.reps, 0)
}

export function sessionSetCount(exercises: LoggedExercise[]): number {
  return exercises.reduce((sum, e) => sum + e.sets.length, 0)
}

export function sessionVolume(exercises: LoggedExercise[]): number {
  return exercises.reduce((sum, e) => sum + exerciseVolume(e), 0)
}

export function calculateWorkoutStats(session: Pick<WorkoutSession, 'exercises' | 'startedAt' | 'finishedAt'>): WorkoutStats {
  const durationMinutes = Math.max(1, Math.round(
    (new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000,
  ))
  return {
    exerciseCount: session.exercises.length,
    setCount: sessionSetCount(session.exercises),
    totalVolume: sessionVolume(session.exercises),
    durationMinutes,
  }
}

export function aggregateWorkoutStats(sessions: Pick<WorkoutSession, 'exercises'>[]) {
  return sessions.reduce((acc, s) => ({
    exerciseCount: acc.exerciseCount + s.exercises.length,
    setCount: acc.setCount + sessionSetCount(s.exercises),
    totalVolume: acc.totalVolume + sessionVolume(s.exercises),
  }), { exerciseCount: 0, setCount: 0, totalVolume: 0 })
}
