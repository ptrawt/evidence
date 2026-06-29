export const CALORIE_STATUS_COLOR = {
  safe: '#22c55e',
  warning: '#f59e0b',
  over: '#ef4444',
} as const

export const CALORIE_STATUS_LABEL = {
  safe: 'SAFE',
  warning: 'WARNING',
  over: 'OVER',
} as const

export const DIALOG_PAPER_SX = {
  bgcolor: 'background.paper',
  backgroundImage: 'none',
} as const

export const todayISO = (): string => new Date().toISOString().slice(0, 10)

export const dateOffsetISO = (daysBack: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().slice(0, 10)
}
