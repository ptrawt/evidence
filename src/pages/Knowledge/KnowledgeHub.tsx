import { useState } from 'react'
import {
  Box, Typography, Card, Button, Chip, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import { DeleteOutlined as DeleteIcon } from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addKnowledgeAsync, deleteKnowledgeAsync } from '../../store/knowledgeSlice'
import {
  selectTodayMinutes, selectWeekMinutes, selectWeekTopics, selectRecentKnowledge,
} from '../../store/knowledgeSelectors'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { useAuth } from '../../contexts/AuthContext'
import type { KnowledgeType } from '../../lib/db/knowledge'
import { PILLARS } from '../../types'

const TYPE_CONFIG: Record<KnowledgeType, { emoji: string; label: string }> = {
  book:     { emoji: '📚', label: 'Book' },
  article:  { emoji: '📰', label: 'Article' },
  course:   { emoji: '🎓', label: 'Course' },
  video:    { emoji: '▶️', label: 'Video' },
  practice: { emoji: '💻', label: 'Practice' },
  leetcode: { emoji: '⚡', label: 'LeetCode' },
  other:    { emoji: '🔍', label: 'Other' },
}

const MINUTE_PRESETS = [15, 30, 45, 60, 90, 120]

const xpForMinutes = (m: number) => Math.min(Math.floor(m / 15) * 5, 30)

const formatMinutes = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m}m`

const CAREER = PILLARS.find(p => p.id === 'career')!
const MIND = PILLARS.find(p => p.id === 'mind')!

interface FormState {
  pillar: 'career' | 'mind'
  type: KnowledgeType
  topic: string
  minutes: number
  customMinutes: string
  notes: string
}

const defaultForm = (): FormState => ({
  pillar: 'career', type: 'practice', topic: '',
  minutes: 30, customMinutes: '', notes: '',
})

export default function KnowledgeHub() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const todayMinutes = useAppSelector(selectTodayMinutes)
  const weekMinutes = useAppSelector(selectWeekMinutes)
  const weekTopics = useAppSelector(selectWeekTopics)
  const recentEntries = useAppSelector(selectRecentKnowledge)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm())

  const effectiveMinutes = form.customMinutes ? parseInt(form.customMinutes) || 0 : form.minutes
  const xp = xpForMinutes(effectiveMinutes)

  const handleAdd = () => {
    if (!form.topic.trim() || !user || effectiveMinutes <= 0) return
    const today = new Date().toISOString().slice(0, 10)
    const entry = {
      id: nanoid(), date: today, pillar: form.pillar,
      topic: form.topic.trim(), type: form.type,
      minutes: effectiveMinutes, notes: form.notes,
      createdAt: new Date().toISOString(),
    }
    dispatch(addKnowledgeAsync({ userId: user.id, entry }))
    dispatch(addEvidenceAsync({
      userId: user.id,
      entry: {
        id: nanoid(), pillar: form.pillar,
        category: `${TYPE_CONFIG[form.type].emoji} ${form.topic.trim()}`,
        xp,
        note: `${formatMinutes(effectiveMinutes)}${form.notes ? ' — ' + form.notes : ''}`,
        createdAt: new Date().toISOString(),
      },
    }))
    setOpen(false)
    setForm(defaultForm())
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>🧠 Knowledge</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Learn · Practice · Grow</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 3 }}>
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>วันนี้</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: CAREER.color }}>
            {formatMinutes(todayMinutes)}
          </Typography>
        </Card>
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>7 วัน</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: MIND.color }}>
            {formatMinutes(weekMinutes)}
          </Typography>
        </Card>
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Topics</Typography>
          <Typography variant="h6" fontWeight={800}>{weekTopics}</Typography>
        </Card>
      </Box>

      {/* Add Button */}
      <Button
        variant="contained" fullWidth
        onClick={() => { setForm(defaultForm()); setOpen(true) }}
        sx={{ mb: 3, py: 1.5, fontWeight: 800, fontSize: '1rem', bgcolor: 'primary.main', color: '#000' }}
      >
        + Log Session
      </Button>

      {/* History */}
      {recentEntries.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ยังไม่มี session บันทึกไว้
          </Typography>
        </Card>
      ) : (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Sessions</Typography>
          <Card sx={{ mt: 1 }}>
            {recentEntries.map((e, i, arr) => {
              const cfg = TYPE_CONFIG[e.type]
              const pillarCfg = e.pillar === 'career' ? CAREER : MIND
              const showDate = i === 0 || arr[i - 1].date !== e.date
              return (
                <Box key={e.id}>
                  {showDate && (
                    <Box sx={{ px: 2, pt: i === 0 ? 1.5 : 1.5, pb: 0.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {e.date === new Date().toISOString().slice(0, 10)
                          ? 'วันนี้'
                          : new Date(e.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </Typography>
                    </Box>
                  )}
                  {!showDate && i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', px: 2, py: 1.25, gap: 1.5 }}>
                    <Typography fontSize={20} sx={{ mt: 0.25 }}>{cfg.emoji}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight={700}>{e.topic}</Typography>
                        <Chip
                          label={e.pillar}
                          size="small"
                          sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700,
                            bgcolor: `${pillarCfg.color}18`, color: pillarCfg.color }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {cfg.label} · {formatMinutes(e.minutes)} · +{xpForMinutes(e.minutes)} XP
                        </Typography>
                      </Box>
                      {e.notes && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                          {e.notes}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => dispatch(deleteKnowledgeAsync(e.id))}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, mt: 0.25 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Card>
        </>
      )}

      {/* Log Dialog */}
      <Dialog
        open={open} onClose={() => setOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>📖 Log Learning Session</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Pillar */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Pillar</Typography>
          <ToggleButtonGroup
            exclusive value={form.pillar}
            onChange={(_, v) => { if (v) setForm(f => ({ ...f, pillar: v })) }}
            sx={{ display: 'flex', mt: 0.75, mb: 2.5 }}
          >
            {([CAREER, MIND] as typeof PILLARS).map(p => (
              <ToggleButton key={p.id} value={p.id} sx={{
                flex: 1, gap: 0.75, fontWeight: 700,
                '&.Mui-selected': { bgcolor: `${p.color}18 !important`, color: `${p.color} !important`, borderColor: `${p.color} !important` },
              }}>
                {p.emoji} {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Topic */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Topic</Typography>
          <TextField
            fullWidth autoFocus
            placeholder="Spring Boot, LeetCode DP, Meditations..."
            value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            size="small" sx={{ mt: 0.75, mb: 2.5 }}
          />

          {/* Type */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Type</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, mt: 0.75, mb: 2.5 }}>
            {(Object.entries(TYPE_CONFIG) as [KnowledgeType, { emoji: string; label: string }][]).map(([k, v]) => (
              <ToggleButton
                key={k} value={k} selected={form.type === k}
                onChange={() => setForm(f => ({ ...f, type: k }))}
                sx={{
                  flexDirection: 'column', py: 1, gap: 0.25,
                  border: '1px solid rgba(255,255,255,0.08) !important',
                  borderRadius: '8px !important',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(245,158,11,0.12) !important',
                    borderColor: '#f59e0b !important',
                    color: '#f59e0b',
                  },
                }}
              >
                <Typography fontSize={16}>{v.emoji}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>{v.label}</Typography>
              </ToggleButton>
            ))}
          </Box>

          {/* Time */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Time</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75, mb: 1 }}>
            {MINUTE_PRESETS.map(m => (
              <Chip
                key={m}
                label={formatMinutes(m)}
                onClick={() => setForm(f => ({ ...f, minutes: m, customMinutes: '' }))}
                sx={{
                  fontWeight: 700, cursor: 'pointer',
                  bgcolor: form.minutes === m && !form.customMinutes ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                  color: form.minutes === m && !form.customMinutes ? '#f59e0b' : 'text.secondary',
                  border: form.minutes === m && !form.customMinutes ? '1px solid #f59e0b44' : '1px solid transparent',
                }}
              />
            ))}
          </Box>
          <TextField
            fullWidth placeholder="Custom (minutes)" type="number"
            value={form.customMinutes}
            onChange={e => setForm(f => ({ ...f, customMinutes: e.target.value }))}
            size="small" sx={{ mb: 2.5 }}
            slotProps={{ htmlInput: { min: 1 } }}
          />

          {/* Notes */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Notes (optional)</Typography>
          <TextField
            fullWidth multiline rows={2}
            placeholder="Key takeaways, insights, page numbers..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            size="small" sx={{ mt: 0.75 }}
          />

          <Chip
            label={`+${xp} XP · ${formatMinutes(effectiveMinutes)}`}
            sx={{ mt: 2, alignSelf: 'flex-start', bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!form.topic.trim() || effectiveMinutes <= 0}
            onClick={handleAdd}
            sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, flex: 1 }}
          >
            Log Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
