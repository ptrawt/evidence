import { useState } from 'react'
import {
  Box, Typography, Card, Button, LinearProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, ToggleButton, ToggleButtonGroup, Switch,
  FormControlLabel,
} from '@mui/material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { patchBodyDaily, saveBodyDaily } from '../../store/bodyDailySlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { useAuth } from '../../contexts/AuthContext'
import type { BodyDaily } from '../../lib/db/bodyDaily'

const GLASS_ML = 250
const WATER_GOAL_GLASSES = 8
const WATER_GOAL = GLASS_ML * WATER_GOAL_GLASSES
const SLEEP_GOAL = 8

const MOOD_OPTIONS = [
  { value: 1, emoji: '😤', label: 'แย่มาก' },
  { value: 2, emoji: '😕', label: 'แย่' },
  { value: 3, emoji: '😐', label: 'ปานกลาง' },
  { value: 4, emoji: '🙂', label: 'ดี' },
  { value: 5, emoji: '😄', label: 'ดีมาก' },
]

const ENERGY_OPTIONS = [
  { value: 1, emoji: '💀', label: 'หมดแรง' },
  { value: 2, emoji: '😴', label: 'ง่วง' },
  { value: 3, emoji: '😐', label: 'พอไหว' },
  { value: 4, emoji: '⚡', label: 'มีแรง' },
  { value: 5, emoji: '🔥', label: 'พลังเต็ม' },
]

type SaveFn = (patch: Partial<BodyDaily>) => void

function QuickPickCard({
  emoji, label, value, options, fieldKey, color, save,
}: {
  emoji: string
  label: string
  value: number
  options: { value: number; emoji: string; label: string }[]
  fieldKey: string
  color: string
  save: SaveFn
}) {
  const selected = options.find(o => o.value === value)
  return (
    <Card sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 18 }}>{selected ? selected.emoji : emoji}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1 }}>{label}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: value ? color : 'text.secondary', fontSize: '0.7rem' }}>
            {selected ? selected.label : '—'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {options.map(o => (
          <Box
            key={o.value}
            onClick={() => save({ [fieldKey]: o.value } as Partial<BodyDaily>)}
            sx={{
              flex: 1, textAlign: 'center', py: 0.5, borderRadius: 1.5, cursor: 'pointer',
              fontSize: 18, lineHeight: 1.6,
              bgcolor: value === o.value ? `${color}20` : 'rgba(255,255,255,0.04)',
              border: value === o.value ? `1px solid ${color}50` : '1px solid transparent',
              transition: 'all 0.12s',
              '&:hover': { bgcolor: `${color}15` },
            }}
          >
            {o.emoji}
          </Box>
        ))}
      </Box>
    </Card>
  )
}

function MoodCard({ record, save }: { record: { mood: number }; save: SaveFn }) {
  return (
    <QuickPickCard
      emoji="😊" label="Mood" value={record.mood}
      options={MOOD_OPTIONS} fieldKey="mood" color="#a855f7" save={save}
    />
  )
}

function EnergyCard({ record, save }: { record: { energy: number }; save: SaveFn }) {
  return (
    <QuickPickCard
      emoji="⚡" label="Energy" value={record.energy}
      options={ENERGY_OPTIONS} fieldKey="energy" color="#f59e0b" save={save}
    />
  )
}

export default function DailyVitals() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const record = useAppSelector(s => s.bodyDaily)

  const [waterDialog, setWaterDialog] = useState(false)
  const [sleepDialog, setSleepDialog] = useState(false)
  const [ifDialog, setIfDialog] = useState(false)
  const [customGlasses, setCustomGlasses] = useState('')
  const [sleepInput, setSleepInput] = useState('')
  const [sleepError, setSleepError] = useState(false)
  const [ifStart, setIfStart] = useState(record.ifStart || '12:00')
  const [ifEnd, setIfEnd] = useState(record.ifEnd || '20:00')

  const save = (patch: Partial<typeof record>) => {
    if (!user) return
    const updated = { ...record, ...patch }
    dispatch(patchBodyDaily(patch))
    dispatch(saveBodyDaily({ userId: user.id, record: updated }))
  }

  // Water
  const addWater = (glasses: number) => {
    const newMl = record.waterMl + glasses * GLASS_ML
    save({ waterMl: newMl })
    if (newMl >= WATER_GOAL && record.waterMl < WATER_GOAL) {
      dispatch(addEvidenceAsync({
        userId: user!.id,
        entry: { id: nanoid(), pillar: 'body', category: 'Water', xp: 8, note: `${Math.round(newMl / GLASS_ML)} แก้ว`, createdAt: new Date().toISOString() },
      }))
    }
    setWaterDialog(false)
    setCustomGlasses('')
  }

  // Sleep
  const logSleep = () => {
    const h = parseFloat(sleepInput)
    if (isNaN(h) || h <= 0) { setSleepError(true); return }
    save({ sleepHours: h })
    dispatch(addEvidenceAsync({
      userId: user!.id,
      entry: { id: nanoid(), pillar: 'body', category: 'Sleep', xp: 10, note: `${h}h`, createdAt: new Date().toISOString() },
    }))
    setSleepDialog(false)
    setSleepInput('')
    setSleepError(false)
  }

  // IF
  const saveIF = (done?: boolean) => {
    save({ ifStart, ifEnd, ifDone: done ?? record.ifDone })
    if (done && !record.ifDone) {
      dispatch(addEvidenceAsync({
        userId: user!.id,
        entry: { id: nanoid(), pillar: 'body', category: 'IF', xp: 10, note: `${ifStart}–${ifEnd}`, createdAt: new Date().toISOString() },
      }))
    }
    setIfDialog(false)
  }

  const waterPct = Math.min((record.waterMl / WATER_GOAL) * 100, 100)
  const waterDone = record.waterMl >= WATER_GOAL
  const sleepDone = record.sleepHours > 0
  const sleepOk = record.sleepHours >= SLEEP_GOAL

  return (
    <>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
        Daily Vitals
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mt: 1, mb: 3 }}>

        {/* Water */}
        <Card
          onClick={() => setWaterDialog(true)}
          sx={{ p: 2, cursor: 'pointer', '&:hover': { borderColor: '#3b82f622' }, position: 'relative' }}
        >
          {waterDone && (
            <Chip label="✓" size="small" sx={{ position: 'absolute', top: 8, right: 8, height: 18, fontSize: '0.6rem', bgcolor: '#3b82f620', color: '#3b82f6' }} />
          )}
          <Typography sx={{ fontSize: 22, mb: 0.5 }}>💧</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Water</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: waterDone ? '#3b82f6' : 'text.primary', lineHeight: 1 }}>
            {Math.round(record.waterMl / GLASS_ML)} แก้ว
          </Typography>
          <LinearProgress
            variant="determinate"
            value={waterPct}
            sx={{
              mt: 1, height: 3, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 2 },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            /{WATER_GOAL_GLASSES} แก้ว
          </Typography>
        </Card>

        {/* Sleep */}
        <Card
          onClick={() => { setSleepInput(record.sleepHours > 0 ? String(record.sleepHours) : ''); setSleepDialog(true) }}
          sx={{ p: 2, cursor: 'pointer', '&:hover': { borderColor: '#a855f722' } }}
        >
          <Typography sx={{ fontSize: 22, mb: 0.5 }}>🌙</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Sleep</Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: sleepDone ? (sleepOk ? '#22c55e' : '#f59e0b') : 'text.secondary', lineHeight: 1 }}
          >
            {sleepDone ? `${record.sleepHours}h` : '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 1 }}>
            {sleepDone ? (sleepOk ? 'ดี 👍' : `เป้า ${SLEEP_GOAL}h`) : `เป้า ${SLEEP_GOAL}h`}
          </Typography>
        </Card>

        {/* IF */}
        <Card
          onClick={() => { setIfStart(record.ifStart || '12:00'); setIfEnd(record.ifEnd || '20:00'); setIfDialog(true) }}
          sx={{ p: 2, cursor: 'pointer', '&:hover': { borderColor: '#f59e0b22' } }}
        >
          <Typography sx={{ fontSize: 22, mb: 0.5 }}>⏰</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>IF</Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: record.ifDone ? '#22c55e' : 'text.secondary', lineHeight: 1 }}
          >
            {record.ifDone ? 'Done ✓' : '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 1 }}>
            {record.ifStart && record.ifEnd ? `${record.ifStart}–${record.ifEnd}` : '16:8'}
          </Typography>
        </Card>
      </Box>

      {/* Mood + Energy */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: -1.5, mb: 3 }}>
        <MoodCard record={record} save={save} />
        <EnergyCard record={record} save={save} />
      </Box>

      {/* Water Dialog */}
      <Dialog open={waterDialog} onClose={() => { setWaterDialog(false); setCustomGlasses('') }} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>💧 Log Water</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            วันนี้: <strong>{Math.round(record.waterMl / GLASS_ML)} แก้ว</strong> / {WATER_GOAL_GLASSES} แก้ว
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            {[1, 2, 3, 4].map(g => (
              <Button key={g} variant="outlined" onClick={() => addWater(g)}
                sx={{ borderColor: '#3b82f644', color: '#3b82f6', fontWeight: 700 }}>
                +{g} แก้ว
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth label="จำนวนแก้ว" value={customGlasses} type="number"
              onChange={e => setCustomGlasses(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 1, step: 1, pattern: '[0-9]*' } }}
              onKeyDown={e => e.key === 'Enter' && customGlasses && addWater(Number(customGlasses))}
            />
            <Button variant="contained" disabled={!customGlasses} onClick={() => addWater(Number(customGlasses))}
              sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
              Add
            </Button>
          </Box>
          {record.waterMl > 0 && (
            <Button size="small" onClick={() => { save({ waterMl: 0 }); setWaterDialog(false) }}
              sx={{ color: 'error.main', mt: 1.5 }}>
              Reset today
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setWaterDialog(false); setCustomGlasses('') }} sx={{ color: 'text.secondary' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Sleep Dialog */}
      <Dialog open={sleepDialog} onClose={() => { setSleepDialog(false); setSleepError(false) }} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>🌙 Log Sleep</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            คืนที่ผ่านมานอนกี่ชั่วโมง?
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
            {[5, 6, 7, 7.5, 8, 8.5, 9, 10].map(h => (
              <Button key={h} variant={sleepInput === String(h) ? 'contained' : 'outlined'}
                onClick={() => setSleepInput(String(h))}
                sx={{
                  fontWeight: 700, fontSize: '0.8rem',
                  ...(sleepInput === String(h)
                    ? { bgcolor: '#a855f7', color: '#fff', borderColor: '#a855f7' }
                    : { borderColor: 'rgba(255,255,255,0.12)', color: 'text.primary' }
                  ),
                }}>
                {h}h
              </Button>
            ))}
          </Box>
          <TextField
            fullWidth label="หรือพิมพ์เอง (ชั่วโมง)" value={sleepInput} type="number"
            onChange={e => { setSleepInput(e.target.value); setSleepError(false) }}
            size="small"
            error={sleepError}
            helperText={sleepError ? 'กรุณาใส่จำนวนชั่วโมงที่ถูกต้อง' : undefined}
            slotProps={{ htmlInput: { step: '0.5', min: '0', max: '24' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setSleepDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" disabled={!sleepInput} onClick={logSleep}
            sx={{ bgcolor: '#a855f7', color: '#fff', fontWeight: 700, flex: 1 }}>
            Log Sleep
          </Button>
        </DialogActions>
      </Dialog>

      {/* IF Dialog */}
      <Dialog open={ifDialog} onClose={() => setIfDialog(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>⏰ IF Window</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            กรอบเวลาที่กินอาหาร (eating window)
          </Typography>

          {/* Presets */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Preset</Typography>
          <ToggleButtonGroup
            exclusive size="small"
            sx={{ display: 'flex', mt: 0.75, mb: 2 }}
            onChange={(_, v) => {
              if (!v) return
              const presets: Record<string, [string, string]> = {
                '16:8': ['12:00', '20:00'],
                '18:6': ['13:00', '19:00'],
                '20:4': ['14:00', '18:00'],
              }
              const [s, e] = presets[v]
              setIfStart(s); setIfEnd(e)
            }}
          >
            {['16:8', '18:6', '20:4'].map(p => (
              <ToggleButton key={p} value={p} sx={{ flex: 1, fontWeight: 700, fontSize: '0.8rem' }}>{p}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="เริ่มกิน" value={ifStart} type="time"
              onChange={e => setIfStart(e.target.value)}
              size="small" fullWidth
            />
            <TextField
              label="หยุดกิน" value={ifEnd} type="time"
              onChange={e => setIfEnd(e.target.value)}
              size="small" fullWidth
            />
          </Box>

          <FormControlLabel
            control={
              <Switch checked={record.ifDone} onChange={e => { setIfDialog(false); saveIF(e.target.checked) }} color="success" />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Mark as Done today</Typography>}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setIfDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={() => saveIF()}
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, flex: 1 }}>
            Save Window
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
