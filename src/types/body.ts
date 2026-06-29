export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'เช้า',
  lunch: 'กลางวัน',
  dinner: 'เย็น',
  snack: 'อื่นๆ',
}

export const MEAL_EMOJI: Record<Meal, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

export interface FoodEntry {
  id: string
  date: string
  meal: Meal
  name: string
  kcal: number
  protein: number
  note: string
  createdAt: string
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
  createdAt: string
}

export interface BodySettings {
  calorieTarget: number
  proteinTarget: number
  strictMode: boolean
  weightGoal?: number
}

export const DEFAULT_BODY_SETTINGS: BodySettings = {
  calorieTarget: 2000,
  proteinTarget: 150,
  strictMode: false,
  weightGoal: undefined,
}
