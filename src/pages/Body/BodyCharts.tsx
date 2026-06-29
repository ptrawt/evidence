import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Scatter,
} from 'recharts'
import { useAppSelector } from '../../store/hooks'
import { selectLast7DayCalories, selectLast14DayWeight, selectBodySettings } from '../../store/bodySelectors'

function shortDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const CHART_STYLE = {
  fontSize: 11,
  fill: '#94a3b8',
}

export default function BodyCharts() {
  const navigate = useNavigate()
  const calorieData = useAppSelector(selectLast7DayCalories)
  const weightData = useAppSelector(selectLast14DayWeight)
  const settings = useAppSelector(selectBodySettings)

  const calChartData = calorieData.map(d => ({ ...d, date: shortDate(d.date) }))
  const wgtChartData = weightData.map(d => ({ ...d, date: shortDate(d.date) }))

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')} sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>
        Back
      </Button>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Charts</Typography>

      {/* Calorie Chart */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Calories / Day</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          7 วันล่าสุด · เป้า {settings.calorieTarget} kcal
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={calChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={CHART_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ bgcolor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <Bar dataKey="kcal" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.85} name="kcal" />
            <ReferenceLine y={settings.calorieTarget} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
          </ComposedChart>
        </ResponsiveContainer>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>kcal</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#ef4444', borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Target {settings.calorieTarget}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Weight Chart */}
      <Card sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Weight / Day</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          14 วันล่าสุด · เส้นเฉลี่ย 7 วัน
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={wgtChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={CHART_STYLE} axisLine={false} tickLine={false} />
            <YAxis
              tick={CHART_STYLE}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Scatter dataKey="weight" fill="#22c55e" name="weight (kg)" />
            <Line
              dataKey="avg"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="7-day avg"
              connectNulls
              strokeDasharray="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Weight</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#3b82f6', borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>7-day avg</Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
