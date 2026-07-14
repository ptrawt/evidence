import type { LoggedSet, WorkoutSession } from './db/workout'

export type Recommendation = 'increase_weight' | 'increase_reps' | 'stay'

export interface ExerciseTarget {
  repMin: number
  repMax: number
  targetRpe: number
}

export function findLastExerciseSets(sessions: WorkoutSession[], exerciseName: string): LoggedSet[] | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find(e => e.name === exerciseName)
    if (ex && ex.sets.length > 0) return ex.sets
  }
  return null
}

export function getRecommendation(sets: LoggedSet[], target: ExerciseTarget): Recommendation | null {
  const withRpe = sets.filter((s): s is LoggedSet & { rpe: number } => s.rpe !== undefined)
  if (withRpe.length === 0) return null
  const avgRpe = withRpe.reduce((sum, s) => sum + s.rpe, 0) / withRpe.length
  const minReps = Math.min(...sets.map(s => s.reps))
  if (avgRpe < target.targetRpe) {
    return minReps >= target.repMax ? 'increase_weight' : 'increase_reps'
  }
  return 'stay'
}
