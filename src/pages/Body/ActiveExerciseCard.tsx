import { useMemo, useState } from 'react'
import { Box, Typography, Card, Button, TextField, IconButton, Chip } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  removeActiveExercise, setActiveExerciseNotes, logActiveSet, removeActiveSet,
} from '../../store/workoutSlice'
import { saveExerciseTargetAsync } from '../../store/exerciseTargetsSlice'
import {
  selectWorkoutSessions, selectExerciseTargets, selectBodySettings, selectExerciseInfo,
} from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'
import type { LoggedExercise } from '../../lib/db/workout'
import { findLastExerciseSets, getRecommendation } from '../../lib/progressiveOverload'

const RECOMMENDATION_COPY: Record<string, { label: string; detail: string; color: string }> = {
  increase_weight: { label: '🔼 Ready to Increase Weight', detail: 'reps เต็ม range แล้ว ลองเพิ่มน้ำหนักครั้งนี้', color: '#f59e0b' },
  increase_reps: { label: '➕ Ready to Increase Reps', detail: 'ยังไม่ถึง reps สูงสุดของ range ลองเพิ่ม reps ก่อน', color: '#3b82f6' },
  stay: { label: '✅ Stay', detail: 'โหลดพอดีแล้ว รักษาน้ำหนัก/reps เดิมไว้ก่อน', color: '#22c55e' },
}

export default function ActiveExerciseCard({ exercise, exerciseIndex }: { exercise: LoggedExercise; exerciseIndex: number }) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const sessions = useAppSelector(selectWorkoutSessions)
  const targets = useAppSelector(selectExerciseTargets)
  const bodySettings = useAppSelector(selectBodySettings)
  const exerciseInfo = useAppSelector(selectExerciseInfo)
  const info = exerciseInfo[exercise.name]
  const savedTarget = targets[exercise.name]
  const target = useMemo(() => savedTarget ?? {
    repMin: bodySettings.defaultRepMin, repMax: bodySettings.defaultRepMax, targetRpe: bodySettings.defaultTargetRpe,
  }, [savedTarget, bodySettings.defaultRepMin, bodySettings.defaultRepMax, bodySettings.defaultTargetRpe])

  const [weight, setWeight] = useState('')
  const [rpe, setRpe] = useState('')
  const [reps, setReps] = useState('')
  const [editingTarget, setEditingTarget] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [repMin, setRepMin] = useState(String(target.repMin))
  const [repMax, setRepMax] = useState(String(target.repMax))
  const [targetRpe, setTargetRpe] = useState(String(target.targetRpe))

  // findLastExerciseSets scans the full session history — only recompute when
  // sessions or the exercise name actually change, not on every parent re-render.
  const lastSets = useMemo(() => findLastExerciseSets(sessions, exercise.name), [sessions, exercise.name])
  const recommendation = useMemo(() => lastSets ? getRecommendation(lastSets, target) : null, [lastSets, target])

  const handleSaveTarget = () => {
    if (!user) return
    const newTarget = {
      repMin: parseInt(repMin, 10) || bodySettings.defaultRepMin,
      repMax: parseInt(repMax, 10) || bodySettings.defaultRepMax,
      targetRpe: parseInt(targetRpe, 10) || bodySettings.defaultTargetRpe,
    }
    dispatch(saveExerciseTargetAsync({ userId: user.id, exerciseName: exercise.name, target: newTarget }))
    setEditingTarget(false)
  }

  const handleLogSet = () => {
    const r = parseInt(reps, 10)
    if (isNaN(r) || r <= 0) return
    const w = parseFloat(weight)
    const p = parseInt(rpe, 10)
    dispatch(logActiveSet({
      exerciseIndex,
      set: {
        reps: r,
        ...(weight && !isNaN(w) ? { weightKg: w } : {}),
        ...(rpe && !isNaN(p) ? { rpe: p } : {}),
      },
    }))
    setReps('')
  }

  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{exercise.name}</Typography>
        <IconButton size="small" onClick={() => dispatch(removeActiveExercise({ exerciseIndex }))}
          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
        <Chip
          label={`🎯 ${target.repMin}-${target.repMax} reps · RPE ${target.targetRpe}`}
          size="small"
          onClick={() => setEditingTarget(v => !v)}
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
        {info && (
          <Chip
            label="📖 วิธีเล่น"
            size="small"
            onClick={() => setShowInfo(v => !v)}
            sx={{ bgcolor: showInfo ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)', color: showInfo ? '#3b82f6' : 'text.secondary', fontWeight: 600 }}
          />
        )}
      </Box>

      {showInfo && info && (
        <Box sx={{ mb: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {info.details.primaryMuscle && info.details.primaryMuscle.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              <b>Primary:</b> {info.details.primaryMuscle.join(', ')}
            </Typography>
          )}
          {info.details.muscleCues && info.details.muscleCues.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              <b>Cue:</b> {info.details.muscleCues.join(' · ')}
            </Typography>
          )}
          {(info.details.romDown || info.details.romUp) && (
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              <b>ROM:</b> ลงจน {info.details.romDown || '-'} · ขึ้นจน {info.details.romUp || '-'}
            </Typography>
          )}
          {info.details.commonMistakes && info.details.commonMistakes.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              <b>❌ Mistakes:</b> {info.details.commonMistakes.join(' · ')}
            </Typography>
          )}
          {info.details.cautions && info.details.cautions.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              <b>⚠️ ระวัง:</b> {info.details.cautions.join(' · ')}
            </Typography>
          )}
        </Box>
      )}

      {editingTarget && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField label="Rep min" value={repMin} type="number" size="small"
            onChange={e => setRepMin(e.target.value)} sx={{ flex: 1 }} />
          <TextField label="Rep max" value={repMax} type="number" size="small"
            onChange={e => setRepMax(e.target.value)} sx={{ flex: 1 }} />
          <TextField label="Target RPE" value={targetRpe} type="number" size="small"
            onChange={e => setTargetRpe(e.target.value)} sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleSaveTarget}
            sx={{ borderColor: '#22c55e44', color: '#22c55e' }}>
            Save
          </Button>
        </Box>
      )}

      {recommendation && (
        <Box sx={{
          mb: 1.5, p: 1.25, borderRadius: 1.5,
          bgcolor: `${RECOMMENDATION_COPY[recommendation].color}18`,
          border: `1px solid ${RECOMMENDATION_COPY[recommendation].color}44`,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: RECOMMENDATION_COPY[recommendation].color }}>
            {RECOMMENDATION_COPY[recommendation].label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {RECOMMENDATION_COPY[recommendation].detail}
          </Typography>
        </Box>
      )}

      {exercise.sets.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {exercise.sets.map((s, i) => (
            <Chip
              key={i}
              label={`Set${i + 1}: ${s.reps} reps${s.weightKg ? ` × ${s.weightKg}kg` : ''}${s.rpe ? ` · RPE ${s.rpe}` : ''}`}
              size="small"
              onDelete={() => dispatch(removeActiveSet({ exerciseIndex, setIndex: i }))}
              sx={{ bgcolor: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          label="Weight (kg)" value={weight} type="number" size="small"
          onChange={e => setWeight(e.target.value)}
          slotProps={{ htmlInput: { step: '0.5', min: '0' } }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Reps" value={reps} type="number" size="small"
          onChange={e => setReps(e.target.value)}
          slotProps={{ htmlInput: { min: '0' } }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="RPE" value={rpe} type="number" size="small"
          onChange={e => setRpe(e.target.value)}
          slotProps={{ htmlInput: { min: '1', max: '10' } }}
          sx={{ flex: 1 }}
        />
      </Box>

      <Button variant="contained" fullWidth disabled={!reps} onClick={handleLogSet}
        sx={{ bgcolor: '#22c55e', color: '#000', fontWeight: 700, mb: 1.5 }}>
        Log Set {exercise.sets.length + 1}
      </Button>

      <TextField
        label="Notes" value={exercise.notes} size="small" fullWidth
        onChange={e => dispatch(setActiveExerciseNotes({ exerciseIndex, notes: e.target.value }))}
      />
    </Card>
  )
}
