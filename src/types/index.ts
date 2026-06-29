export type Pillar = 'career' | 'body' | 'mind' | 'money'

export interface EvidenceEntry {
  id: string
  pillar: Pillar
  category: string
  xp: number
  note: string
  createdAt: string
}

export interface PillarConfig {
  id: Pillar
  label: string
  emoji: string
  goal: string
  color: string
  categories: string[]
}

export const PILLARS: PillarConfig[] = [
  {
    id: 'career',
    label: 'Career',
    emoji: '💻',
    goal: 'Become Tech Lead',
    color: '#3b82f6',
    categories: [
      'Learning Log', 'Study Hours', 'Books', 'Projects', 'Certificates',
      'Meeting Notes', 'Tech Articles', 'Code Review', 'Presentation',
      'Spring Boot', 'Kotlin', 'WebFlux', 'AWS', 'Terraform', 'Kubernetes',
      'Architecture', 'Leadership', 'English',
    ],
  },
  {
    id: 'body',
    label: 'Body',
    emoji: '💪',
    goal: 'Become healthy',
    color: '#22c55e',
    categories: [
      'Gym', 'Workout', 'Cardio', 'Weight', 'Body Fat', 'Calories',
      'Protein', 'Sleep', 'Water', 'IF', 'Measurements', 'Progress Photos',
      'PR', 'Gym Attendance',
    ],
  },
  {
    id: 'mind',
    label: 'Mind',
    emoji: '🧠',
    goal: 'Keep growing',
    color: '#a855f7',
    categories: [
      'Meditation', 'Journal', 'Books', 'Novel', 'LeetCode',
      'Competitive Programming', 'Algorithms', 'Mood', 'Deep Work Hours',
      'Doomscroll Time',
    ],
  },
  {
    id: 'money',
    label: 'Money',
    emoji: '💰',
    goal: 'Freedom',
    color: '#f59e0b',
    categories: [
      'Savings', 'Investment', 'Emergency Fund', 'Monthly Budget',
      'Impulse Purchase', 'Income', 'Net Worth', 'Side Projects',
    ],
  },
]

export const XP_PRESETS: Record<string, number> = {
  default: 5,
  Gym: 15,
  Workout: 12,
  Cardio: 10,
  Meditation: 10,
  'Deep Work Hours': 15,
  LeetCode: 12,
  'Study Hours': 10,
  Books: 8,
  Journal: 7,
  'No Doomscroll Today': 8,
  Projects: 20,
  Certificates: 25,
}
