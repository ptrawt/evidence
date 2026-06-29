import { Box, Typography, Alert } from '@mui/material'
import { useAppSelector } from '../../store/hooks'
import {
  selectTodayFood, selectTodayWeight, selectCalorieStatus, selectBodySettings,
} from '../../store/bodySelectors'
import { selectStreakByPillar } from '../../store/selectors'

export default function StrictModeAlerts() {
  const todayFood = useAppSelector(selectTodayFood)
  const todayWeight = useAppSelector(selectTodayWeight)
  const calorieStatus = useAppSelector(selectCalorieStatus)
  const settings = useAppSelector(selectBodySettings)
  const streak = useAppSelector(selectStreakByPillar('body'))

  const alerts: { msg: string; severity: 'warning' | 'error' | 'info' }[] = []

  if (!todayWeight) alerts.push({ msg: 'วันนี้ยังไม่ชั่งน้ำหนัก', severity: 'warning' })
  if (todayFood.length === 0) alerts.push({ msg: 'วันนี้ยังไม่ log อาหาร', severity: 'warning' })
  if (calorieStatus === 'over') alerts.push({ msg: `kcal เกินเป้า (${settings.calorieTarget} kcal)`, severity: 'error' })
  if (streak === 0) alerts.push({ msg: 'Streak หลุดแล้ว — กลับมาลง evidence วันนี้เลย', severity: 'error' })

  if (alerts.length === 0) {
    return (
      <Alert severity="success" sx={{ mb: 2, fontWeight: 600 }}>
        Strict Mode: ทุกอย่างโอเค วันนี้ดีมาก 🔥
      </Alert>
    )
  }

  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700, letterSpacing: 1 }}>
        ⚡ STRICT MODE
      </Typography>
      {alerts.map((a, i) => (
        <Alert key={i} severity={a.severity} sx={{ py: 0.5, fontSize: '0.8rem' }}>
          {a.msg}
        </Alert>
      ))}
    </Box>
  )
}
