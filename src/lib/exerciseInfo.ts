export type ExerciseType = 'Compound' | 'Isolation' | 'Compound/Isolation'
export type ExercisePriority = 'High' | 'Medium' | 'Low'

export const EXERCISE_TYPES: ExerciseType[] = ['Compound', 'Isolation', 'Compound/Isolation']
export const EXERCISE_PRIORITIES: ExercisePriority[] = ['High', 'Medium', 'Low']

export interface ExerciseInfoDetails {
  status?: string
  benefits?: string
  primaryMuscle?: string[]
  secondaryMuscle?: string[]
  muscleCues?: string[]
  feelShould?: string[]
  feelShouldNot?: string[]
  howTo?: string[]
  romDown?: string
  romUp?: string
  commonMistakes?: string[]
  adjustmentPoints?: string[]
  breathingIn?: string
  breathingOut?: string
  cautions?: string[]
  setupChecklist?: string[]
  useInWorkout?: string
  mySetting?: string
}

export interface ExerciseInfo {
  exerciseName: string
  category: string
  type: ExerciseType
  difficulty: number
  priority: ExercisePriority
  details: ExerciseInfoDetails
}

export const EMPTY_EXERCISE_INFO_DETAILS: ExerciseInfoDetails = {}

export function difficultyStars(difficulty: number): string {
  return '⭐'.repeat(Math.max(1, Math.min(3, difficulty)))
}
