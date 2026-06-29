import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Button, LinearProgress, Chip, Switch,
  FormControlLabel, Divider,
} from '@mui/material'
import { Restaurant as RestaurantIcon, FitnessCenter as FitnessCenterIcon, BarChart as BarChartIcon, PhotoCamera as PhotoIcon } from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { toggleStrictMode } from '../../store/bodySettingsSlice'
import {
  selectTodayKcal, selectTodayProtein, selectTodayWeight,
  selectBodySettings, selectCalorieStatus, selectTodayFood,
  selectLatestWeight, select7DayAvgWeight, selectLowestWeight,
  selectStartWeight, selectWeightChangeThisWeek,
} from '../../store/bodySelectors'
import { MEAL_LABELS, MEAL_EMOJI, type Meal } from '../../types/body'
import { CALORIE_STATUS_COLOR as STATUS_COLOR, CALORIE_STATUS_LABEL as STATUS_LABEL } from '../../lib/constants'
import StrictModeAlerts from './StrictModeAlerts'
import DailyVitals from './DailyVitals'

export default function BodyHub() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const settings = useAppSelector(selectBodySettings)
  const todayKcal = useAppSelector(selectTodayKcal)
  const todayProtein = useAppSelector(selectTodayProtein)
  const todayWeight = useAppSelector(selectTodayWeight)
  const todayFood = useAppSelector(selectTodayFood)
  const calorieStatus = useAppSelector(selectCalorieStatus)
  const latestWeight = useAppSelector(selectLatestWeight)
  const avgWeight = useAppSelector(select7DayAvgWeight)
  const lowestWeight = useAppSelector(selectLowestWeight)
  const startWeight = useAppSelector(selectStartWeight)
  const weekChange = useAppSelector(selectWeightChangeThisWeek)

  const kcalPct = Math.min((todayKcal / settings.calorieTarget) * 100, 100)
  const statusColor = STATUS_COLOR[calorieStatus]
  const remaining = settings.calorieTarget - todayKcal
  const remainingLabel = remaining >= 0 ? String(remaining) : `${Math.abs(remaining)} over`

  const mealGroups = (['breakfast', 'lunch', 'dinner', 'snack'] as Meal[]).map(meal => ({
    meal,
    entries: todayFood.filter(e => e.meal === meal),
  }))

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>💪 Body</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Become healthy</Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={settings.strictMode}
              onChange={() => dispatch(toggleStrictMode())}
              color="warning"
              size="small"
            />
          }
          label={<Typography variant="caption" fontWeight={700} sx={{ color: settings.strictMode ? 'warning.main' : 'text.secondary' }}>STRICT</Typography>}
          labelPlacement="start"
        />
      </Box>

      {settings.strictMode && <StrictModeAlerts />}

      {/* Calorie Budget */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>Daily Calorie Budget</Typography>
          <Chip
            label={STATUS_LABEL[calorieStatus]}
            size="small"
            sx={{ bgcolor: `${statusColor}22`, color: statusColor, fontWeight: 800, fontSize: '0.65rem' }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={kcalPct}
          sx={{
            height: 10, borderRadius: 5, mb: 1.5,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': { bgcolor: statusColor, borderRadius: 5, transition: 'none' },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Consumed</Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: statusColor }}>{todayKcal}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Target</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{settings.calorieTarget}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {calorieStatus === 'over' ? 'Over' : 'Remaining'}
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: statusColor }}>
              {remainingLabel}
            </Typography>
          </Box>
        </Box>
        {todayProtein > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Protein: {todayProtein}g / {settings.proteinTarget}g
          </Typography>
        )}
      </Card>

      {/* Weight Today */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Weight Tracking</Typography>

        {/* Goal progress bar */}
        {settings.weightGoal && startWeight && latestWeight && (() => {
          const start = startWeight.weight
          const goal = settings.weightGoal!
          const current = latestWeight.weight
          const total = start - goal
          const done = start - current
          const pct = Math.min(Math.max((done / total) * 100, 0), 100)
          const lost = (start - current).toFixed(1)
          const remaining = (current - goal).toFixed(1)
          const goalReached = current <= goal
          return (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  🎯 Goal: {start} → {goal} kg
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: goalReached ? '#22c55e' : 'primary.main' }}>
                  {goalReached ? '🏆 Reached!' : `เหลือ ${remaining} kg`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 8, borderRadius: 4, mb: 0.75,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': { bgcolor: goalReached ? '#22c55e' : 'primary.main', borderRadius: 4, transition: 'none' },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ลดไปแล้ว {lost} kg ({pct.toFixed(0)}%)
              </Typography>
            </Box>
          )
        })()}

        <Box sx={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {[
            { label: 'Today', value: todayWeight ? `${todayWeight.weight} kg` : '—' },
            { label: '7-day Avg', value: avgWeight ? `${avgWeight.toFixed(1)} kg` : '—' },
            { label: 'Lowest', value: lowestWeight ? `${lowestWeight.weight} kg` : '—' },
            { label: 'From Start', value: startWeight && latestWeight ? `${(latestWeight.weight - startWeight.weight).toFixed(1)} kg` : '—' },
            { label: 'This Week', value: weekChange !== null ? `${weekChange > 0 ? '+' : ''}${weekChange.toFixed(1)} kg` : '—' },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ width: '33.33%', mb: 1.5, pr: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
              <Typography variant="body2" fontWeight={700}>{value}</Typography>
            </Box>
          ))}
        </Box>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          onClick={() => navigate('/body/weight')}
          sx={{ mt: 0.5, borderColor: '#22c55e44', color: '#22c55e' }}
        >
          {todayWeight ? 'Update Weight' : '+ Log Weight Today'}
        </Button>
      </Card>

      {/* Daily Vitals */}
      <DailyVitals />

      {/* Today's Meals */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Today's Meals</Typography>
        <Button size="small" onClick={() => navigate('/body/food')} sx={{ color: 'primary.main' }}>+ Add Food</Button>
      </Box>

      {mealGroups.map(({ meal, entries }) => (
        entries.length > 0 && (
          <Card key={meal} sx={{ p: 2, mb: 1.5 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              {MEAL_EMOJI[meal]} {MEAL_LABELS[meal]}
            </Typography>
            {entries.map(e => (
              <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2">{e.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {e.kcal} kcal{e.protein > 0 ? ` · ${e.protein}g` : ''}
                </Typography>
              </Box>
            ))}
          </Card>
        )
      ))}

      {todayFood.length === 0 && (
        <Card sx={{ p: 3, textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>ยังไม่ได้ log อาหารวันนี้</Typography>
        </Card>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Quick Nav */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Button fullWidth variant="outlined" startIcon={<RestaurantIcon />}
          onClick={() => navigate('/body/food')}
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.primary' }}>
          Food Log
        </Button>
        <Button fullWidth variant="outlined" startIcon={<FitnessCenterIcon />}
          onClick={() => navigate('/body/weight')}
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.primary' }}>
          Weight
        </Button>
        <Button fullWidth variant="outlined" startIcon={<BarChartIcon />}
          onClick={() => navigate('/body/charts')}
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.primary' }}>
          Charts
        </Button>
        <Button fullWidth variant="outlined" startIcon={<PhotoIcon />}
          onClick={() => navigate('/body/photos')}
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.primary' }}>
          Photos
        </Button>
      </Box>
    </Box>
  )
}
