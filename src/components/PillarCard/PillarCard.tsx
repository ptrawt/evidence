import { useMemo } from 'react'
import { Box, Card, CardActionArea, Typography, LinearProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectXPByPillar, selectStreakByPillar, selectEntriesByPillar } from '../../store/selectors'
import type { PillarConfig } from '../../types'

interface Props {
  pillar: PillarConfig
}

export default function PillarCard({ pillar }: Props) {
  const navigate = useNavigate()

  const xpSelector = useMemo(() => selectXPByPillar(pillar.id), [pillar.id])
  const streakSelector = useMemo(() => selectStreakByPillar(pillar.id), [pillar.id])
  const entriesSelector = useMemo(() => selectEntriesByPillar(pillar.id), [pillar.id])

  const xp = useAppSelector(xpSelector)
  const streak = useAppSelector(streakSelector)
  const count = useAppSelector(s => entriesSelector(s).length)

  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const HUB_ROUTES: Partial<Record<string, string>> = {
    body: '/body', money: '/money',
    career: '/knowledge', mind: '/knowledge',
  }
  const destination = HUB_ROUTES[pillar.id] ?? `/pillars/${pillar.id}`

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        onClick={() => navigate(destination)}
        sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1.5 }}>
          <Typography sx={{ fontSize: 28 }}>{pillar.emoji}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>LVL</Typography>
            <Typography variant="h6" sx={{ color: pillar.color, lineHeight: 1 }}>{level}</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
          {pillar.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {pillar.goal}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={xpInLevel}
          sx={{
            width: '100%', height: 6, borderRadius: 3, mb: 1.5,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': { bgcolor: pillar.color, borderRadius: 3 },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>XP</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: pillar.color }}>{xp}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Streak</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{streak > 0 ? `${streak}d 🔥` : '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Evidence</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{count}</Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
