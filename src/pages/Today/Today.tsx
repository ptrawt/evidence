import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Checkbox, Chip, LinearProgress,
  CircularProgress, Divider, Button,
} from '@mui/material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useAuth } from '../../contexts/AuthContext'
import { completeQuest, uncompleteQuest } from '../../store/questsSlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import {
  selectQuestsByPillar, selectTodayCompletedIds,
  selectTodayXP, selectPillarProgress, selectQuestsStatus,
  selectStreak, selectWeekSummary,
} from '../../store/questSelectors'
import { selectTotalXP, selectEvidenceCount } from '../../store/selectors'
import { selectTodayKcal, selectBodySettings, selectCalorieStatus } from '../../store/bodySelectors'
import { PILLARS, type Pillar } from '../../types'
import { CALORIE_STATUS_COLOR as STATUS_COLOR, todayISO } from '../../lib/constants'

function PillarSection({ pillar }: { pillar: typeof PILLARS[0] }) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const today = todayISO()

  const questsSelector = useMemo(() => selectQuestsByPillar(pillar.id as Pillar), [pillar.id])
  const progressSelector = useMemo(() => selectPillarProgress(pillar.id as Pillar), [pillar.id])

  const quests = useAppSelector(questsSelector)
  const completedIds = useAppSelector(selectTodayCompletedIds)
  const completions = useAppSelector(s => s.quests.completions)
  const { total, done } = useAppSelector(progressSelector)
  const pct = total > 0 ? (done / total) * 100 : 0

  const handleToggle = (questId: string) => {
    if (!user) return
    const isCompleted = completedIds.has(questId)

    if (isCompleted) {
      const completion = completions.find(c => c.questId === questId)
      if (!completion) return
      dispatch(uncompleteQuest({ completionId: completion.id, questId }))
    } else {
      const quest = quests.find(q => q.id === questId)
      if (!quest) return
      dispatch(completeQuest({ userId: user.id, questId, date: today }))
      dispatch(addEvidenceAsync({
        userId: user.id,
        entry: {
          id: nanoid(), pillar: pillar.id as Pillar,
          category: quest.name, xp: quest.xp,
          note: '', createdAt: new Date().toISOString(),
        },
      }))
    }
  }

  if (quests.length === 0) return null

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* Pillar Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 18 }}>{pillar.emoji}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{pillar.label}</Typography>
          <Chip
            label={`${done}/${total}`}
            size="small"
            sx={{
              height: 20, fontSize: '0.65rem', fontWeight: 700,
              bgcolor: done === total && total > 0 ? `${pillar.color}30` : 'rgba(255,255,255,0.06)',
              color: done === total && total > 0 ? pillar.color : 'text.secondary',
            }}
          />
        </Box>
        {done === total && total > 0 && (
          <Typography variant="caption" sx={{ color: pillar.color, fontWeight: 700 }}>✓ Complete</Typography>
        )}
      </Box>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 3, borderRadius: 2, mb: 1.25,
          bgcolor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: pillar.color, borderRadius: 2, transition: 'width 0.3s ease' },
        }}
      />

      <Card>
        {quests.map((quest, i) => {
          const done = completedIds.has(quest.id)
          return (
            <Box key={quest.id}>
              {i > 0 && <Divider />}
              <Box
                onClick={() => handleToggle(quest.id)}
                sx={{
                  display: 'flex', alignItems: 'center', px: 1.5, py: 1,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  bgcolor: done ? `${pillar.color}08` : 'transparent',
                  '&:hover': { bgcolor: done ? `${pillar.color}12` : 'rgba(255,255,255,0.03)' },
                }}
              >
                <Checkbox
                  checked={done}
                  size="small"
                  sx={{
                    p: 0.5, mr: 1,
                    color: 'rgba(255,255,255,0.2)',
                    '&.Mui-checked': { color: pillar.color },
                  }}
                  onClick={e => e.stopPropagation()}
                  onChange={() => handleToggle(quest.id)}
                />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1, fontWeight: done ? 500 : 400,
                    color: done ? 'text.secondary' : 'text.primary',
                    textDecoration: done ? 'line-through' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {quest.name}
                </Typography>
                <Chip
                  label={`+${quest.xp}`}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.6rem', fontWeight: 700, ml: 1,
                    bgcolor: done ? `${pillar.color}20` : 'rgba(255,255,255,0.06)',
                    color: done ? pillar.color : 'text.secondary',
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Card>
    </Box>
  )
}

export default function Today() {
  const navigate = useNavigate()
  const totalXP = useAppSelector(selectTotalXP)
  const totalEvidence = useAppSelector(selectEvidenceCount)
  const todayQuestXP = useAppSelector(selectTodayXP)
  const streak = useAppSelector(selectStreak)
  const weekSummary = useAppSelector(selectWeekSummary)
  const status = useAppSelector(selectQuestsStatus)
  const todayKcal = useAppSelector(selectTodayKcal)
  const settings = useAppSelector(selectBodySettings)
  const calorieStatus = useAppSelector(selectCalorieStatus)

  const today = new Date()
  const dateLabel = today.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress sx={{ color: 'primary.main' }} size={32} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1 }}>
            {dateLabel.toUpperCase()}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>Today</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          {streak > 0 && (
            <Chip
              label={`🔥 Day ${streak}`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: 'rgba(245,158,11,0.15)', color: 'primary.main', fontSize: '0.75rem' }}
            />
          )}
          {weekSummary.total > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              สัปดาห์นี้ {weekSummary.done}/{weekSummary.total}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{
        display: 'flex', gap: 1.5, mb: 3,
        p: 2, borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)',
        border: '1px solid rgba(245,158,11,0.15)',
      }}>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total XP</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
            {totalXP.toLocaleString()}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Today XP</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: todayQuestXP > 0 ? '#22c55e' : 'text.secondary', lineHeight: 1.2 }}>
            +{todayQuestXP}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Evidence</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{totalEvidence}</Typography>
        </Box>
      </Box>

      {/* Body quick stat */}
      {todayKcal > 0 && (
        <Card
          onClick={() => navigate('/body')}
          sx={{ p: 1.5, mb: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Typography sx={{ fontSize: 20 }}>💪</Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min((todayKcal / settings.calorieTarget) * 100, 100)}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: STATUS_COLOR[calorieStatus], borderRadius: 3, transition: 'none',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {todayKcal} / {settings.calorieTarget} kcal
            </Typography>
          </Box>
        </Card>
      )}

      {/* Daily Habits */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Daily Habits</Typography>
          <Chip
            label="🔄 ทุกวัน"
            size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary' }}
          />
        </Box>
        <Button
          size="small"
          onClick={() => navigate('/quests')}
          sx={{ color: 'text.secondary', fontSize: '0.7rem', minWidth: 0, p: '2px 8px' }}
        >
          ✏️ Edit
        </Button>
      </Box>

      {PILLARS.map(pillar => (
        <PillarSection key={pillar.id} pillar={pillar} />
      ))}
    </Box>
  )
}
