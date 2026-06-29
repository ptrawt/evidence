import type { Pillar } from './index'

export interface Quest {
  id: string
  pillar: Pillar
  name: string
  xp: number
  isPreset: boolean
  sortOrder: number
  createdAt: string
}

export interface DailyCompletion {
  id: string
  questId: string
  date: string
  createdAt: string
}

export const DEFAULT_QUESTS: Omit<Quest, 'id' | 'createdAt'>[] = [
  // Career
  { pillar: 'career', name: 'Study 30 min', xp: 10, isPreset: true, sortOrder: 0 },
  { pillar: 'career', name: 'Read Spring Boot', xp: 10, isPreset: true, sortOrder: 1 },
  { pillar: 'career', name: 'Code Review', xp: 8, isPreset: true, sortOrder: 2 },
  { pillar: 'career', name: 'Architecture note', xp: 8, isPreset: true, sortOrder: 3 },
  { pillar: 'career', name: 'Terraform lab', xp: 12, isPreset: true, sortOrder: 4 },
  // Body
  { pillar: 'body', name: 'Gym / Workout', xp: 15, isPreset: true, sortOrder: 0 },
  { pillar: 'body', name: 'Log calories', xp: 5, isPreset: true, sortOrder: 1 },
  { pillar: 'body', name: 'Weigh in', xp: 8, isPreset: true, sortOrder: 2 },
  { pillar: 'body', name: 'Hit protein target', xp: 10, isPreset: true, sortOrder: 3 },
  { pillar: 'body', name: 'IF 16/8', xp: 10, isPreset: true, sortOrder: 4 },
  { pillar: 'body', name: 'Cardio 30 min', xp: 10, isPreset: true, sortOrder: 5 },
  // Mind
  { pillar: 'mind', name: 'LeetCode 1 problem', xp: 12, isPreset: true, sortOrder: 0 },
  { pillar: 'mind', name: 'Read book 30 min', xp: 8, isPreset: true, sortOrder: 1 },
  { pillar: 'mind', name: 'Meditate', xp: 10, isPreset: true, sortOrder: 2 },
  { pillar: 'mind', name: 'No doomscroll after 22:00', xp: 8, isPreset: true, sortOrder: 3 },
  { pillar: 'mind', name: 'Deep work 2h', xp: 15, isPreset: true, sortOrder: 4 },
  // Money
  { pillar: 'money', name: 'Log expenses', xp: 5, isPreset: true, sortOrder: 0 },
  { pillar: 'money', name: 'No impulse purchase', xp: 8, isPreset: true, sortOrder: 1 },
  { pillar: 'money', name: 'Transfer to savings', xp: 8, isPreset: true, sortOrder: 2 },
  { pillar: 'money', name: 'Investment review', xp: 10, isPreset: true, sortOrder: 3 },
]
