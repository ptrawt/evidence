import { useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  Box, Typography, Button, LinearProgress, Chip, Divider,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppSelector } from '../../store/hooks'
import { selectEntriesByPillar, selectXPByPillar, selectStreakByPillar } from '../../store/selectors'
import EvidenceCard from '../../components/EvidenceCard/EvidenceCard'
import { PILLARS, type Pillar } from '../../types'

export default function PillarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pillar = PILLARS.find(p => p.id === id)

  const entriesSelector = useMemo(() => selectEntriesByPillar((id ?? 'career') as Pillar), [id])
  const xpSelector = useMemo(() => selectXPByPillar((id ?? 'career') as Pillar), [id])
  const streakSelector = useMemo(() => selectStreakByPillar((id ?? 'career') as Pillar), [id])

  const entries = useAppSelector(entriesSelector)
  const xp = useAppSelector(xpSelector)
  const streak = useAppSelector(streakSelector)

  if (!pillar) return <Navigate to="/pillars" replace />

  const HUB_PATH: Record<string, string> = { career: '/knowledge', mind: '/knowledge', body: '/body', money: '/money' }
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const totalCount = entries.length

  const categoryBreakdown = entries.reduce<Record<string, { count: number; xp: number }>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { count: 0, xp: 0 }
    acc[e.category].count++
    acc[e.category].xp += e.xp
    return acc
  }, {})

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 5)

  return (
    <Box sx={{ p: 3 }}>
      {/* Back */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/pillars')}
        sx={{ color: 'text.secondary', mb: 2, ml: -1 }}
      >
        Back
      </Button>

      {/* Header */}
      <Box sx={{
        p: 3, mb: 3,
        background: `linear-gradient(135deg, ${pillar.color}18 0%, ${pillar.color}06 100%)`,
        border: `1px solid ${pillar.color}30`,
        borderRadius: 3,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 36 }}>{pillar.emoji}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: pillar.color, mt: 0.5 }}>
              {pillar.label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{pillar.goal}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>LEVEL</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: pillar.color, lineHeight: 1 }}>
              {level}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={xpInLevel}
          sx={{
            height: 8, borderRadius: 4, mb: 2,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': { bgcolor: pillar.color, borderRadius: 4 },
          }}
        />

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total XP</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: pillar.color }}>{xp}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Streak</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {streak > 0 ? `${streak}d 🔥` : '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Evidence</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalCount}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Top Activities */}
      {topCategories.length > 0 && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            Top Activities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 3 }}>
            {topCategories.map(([cat, stat]) => (
              <Chip
                key={cat}
                label={`${cat} · ${stat.xp}XP`}
                size="small"
                sx={{ bgcolor: `${pillar.color}18`, color: pillar.color, fontWeight: 600 }}
              />
            ))}
          </Box>
        </>
      )}

      {/* Hub Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => navigate(HUB_PATH[pillar.id] ?? '/pillars')}
        sx={{
          mb: 3, py: 1.25,
          borderColor: pillar.color,
          color: pillar.color,
          '&:hover': { bgcolor: `${pillar.color}10`, borderColor: pillar.color },
        }}
      >
        Go to {pillar.label} Hub
      </Button>

      {/* Evidence List */}
      {entries.length > 0 ? (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            Evidence History
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {entries.map((entry, i) => (
              <EvidenceCard key={entry.id} entry={entry} index={totalCount - i} showDelete />
            ))}
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No evidence for this pillar yet. Start logging!
          </Typography>
        </Box>
      )}
    </Box>
  )
}
