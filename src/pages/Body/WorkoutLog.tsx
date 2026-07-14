import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Button, TextField, IconButton, Divider,
  Autocomplete, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon, DeleteOutlined as DeleteIcon,
  Add as AddIcon, Tune as TuneIcon, MenuBook as MenuBookIcon,
} from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  startActiveWorkout, cancelActiveWorkout, addActiveExercise, finishWorkoutAsync, deleteWorkoutSessionAsync,
} from '../../store/workoutSlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { registerExercisesIfNewAsync } from '../../store/customExercisesSlice'
import {
  selectActiveWorkout, selectWorkoutSessions, selectTodaySplitExercises, selectWorkoutWeekNumber,
  selectExerciseOptions,
} from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'
import { todayISO, DIALOG_PAPER_SX } from '../../lib/constants'
import { WEEKDAY_LABELS, todayWeekDay } from '../../lib/db/workoutSplit'
import type { WorkoutSession } from '../../lib/db/workout'
import { calculateWorkoutStats, exerciseVolume, sessionSetCount } from '../../lib/workoutStats'
import ActiveExerciseCard from './ActiveExerciseCard'
import ElapsedTimer from './ElapsedTimer'

export default function WorkoutLog() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const active = useAppSelector(selectActiveWorkout)
  const sessions = useAppSelector(selectWorkoutSessions)
  const todaySplit = useAppSelector(selectTodaySplitExercises)
  const weekNumber = useAppSelector(selectWorkoutWeekNumber)
  const exerciseOptions = useAppSelector(selectExerciseOptions)

  const [exerciseInput, setExerciseInput] = useState('')
  const [finishedSummary, setFinishedSummary] = useState<WorkoutSession | null>(null)

  const totalSets = active ? sessionSetCount(active.exercises) : 0
  const dayLabel = WEEKDAY_LABELS[todayWeekDay()]

  const handleAddExercise = () => {
    const name = exerciseInput.trim()
    if (!name) return
    dispatch(addActiveExercise({ name }))
    if (user) dispatch(registerExercisesIfNewAsync({ userId: user.id, names: [name] }))
    setExerciseInput('')
  }

  const handleCancel = () => {
    if (window.confirm('ยกเลิก workout นี้ทั้งหมด?')) dispatch(cancelActiveWorkout())
  }

  const handleFinish = () => {
    if (!active || !user || totalSets === 0) return
    const finishedAt = new Date().toISOString()
    const xp = 15 + totalSets
    const session = {
      id: nanoid(),
      date: todayISO(),
      startedAt: active.startedAt,
      finishedAt,
      exercises: active.exercises,
      notes: active.notes,
      xp,
      createdAt: finishedAt,
    }
    dispatch(finishWorkoutAsync({ userId: user.id, session }))
    dispatch(addEvidenceAsync({
      userId: user.id,
      entry: {
        id: nanoid(), pillar: 'body', category: 'Workout', xp,
        note: `${active.exercises.length} exercises · ${totalSets} sets`,
        createdAt: finishedAt,
      },
    }))
    setFinishedSummary(session)
  }

  const pastSessions = [...sessions].reverse()
  const finishedStats = finishedSummary ? calculateWorkoutStats(finishedSummary) : null

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, ml: -1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')} sx={{ color: 'text.secondary' }}>Back</Button>
        <Box sx={{ display: 'flex' }}>
          <Button startIcon={<MenuBookIcon />} onClick={() => navigate('/body/exercises')} sx={{ color: 'text.secondary' }}>Library</Button>
          <Button startIcon={<TuneIcon />} onClick={() => navigate('/body/workout/split')} sx={{ color: 'text.secondary' }}>Split</Button>
        </Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>🏋️ Workout Log</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Week {weekNumber} · {dayLabel}
      </Typography>

      {!active && (
        <Card sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          {todaySplit.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              โปรแกรมวันนี้: {todaySplit.join(', ')}
            </Typography>
          )}
          <Button variant="contained" fullWidth
            onClick={() => dispatch(startActiveWorkout(todaySplit.length > 0 ? { prefillNames: todaySplit } : undefined))}
            sx={{ bgcolor: '#22c55e', color: '#000', fontWeight: 800, py: 1.25 }}>
            Start Workout
          </Button>
        </Card>
      )}

      {active && (
        <>
          <Card sx={{ p: 2.5, mb: 2, border: '1px solid rgba(34,197,94,0.35)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Elapsed</Typography>
                <ElapsedTimer startedAt={active.startedAt} />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sets logged</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{totalSets}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Autocomplete
                freeSolo
                options={exerciseOptions}
                inputValue={exerciseInput}
                onInputChange={(_, value) => setExerciseInput(value)}
                onChange={(_, value) => value && setExerciseInput(value)}
                sx={{ flex: 1 }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Add exercise"
                    size="small"
                    helperText="พิมพ์ชื่อท่าเองก็ได้ ไม่ต้องมีใน list"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddExercise() } }}
                  />
                )}
              />
              <Button variant="outlined" onClick={handleAddExercise} disabled={!exerciseInput.trim()}
                sx={{ borderColor: '#22c55e44', color: '#22c55e', px: 1.5, alignSelf: 'flex-start' }}>
                <AddIcon fontSize="small" />
              </Button>
            </Box>
          </Card>

          {active.exercises.map((exercise, i) => (
            <ActiveExerciseCard key={i} exercise={exercise} exerciseIndex={i} />
          ))}

          {active.exercises.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', my: 2 }}>
              เพิ่มท่าออกกำลังกายด้านบนเพื่อเริ่มจด
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 3 }}>
            <Button variant="outlined" onClick={handleCancel}
              sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button variant="contained" fullWidth disabled={totalSets === 0} onClick={handleFinish}
              sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 800 }}>
              Finish Workout {totalSets > 0 && `(+${15 + totalSets} XP)`}
            </Button>
          </Box>
        </>
      )}

      {pastSessions.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>ประวัติ</Typography>
          <Card sx={{ mt: 1 }}>
            {pastSessions.map((s, i) => {
              const setsCount = sessionSetCount(s.exercises)
              return (
                <Box key={s.id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {s.exercises.map(e => e.name).join(', ') || 'Workout'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(s.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}{setsCount} sets · +{s.xp} XP
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => dispatch(deleteWorkoutSessionAsync(s.id))}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Card>
        </>
      )}

      {finishedSummary && (
        <Dialog open onClose={() => setFinishedSummary(null)} fullWidth maxWidth="sm"
          slotProps={{ paper: { sx: DIALOG_PAPER_SX } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>🎉 Workout Complete!</DialogTitle>
          <DialogContent>
            {finishedStats && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  {[
                    { label: 'Duration', value: `${finishedStats.durationMinutes} min` },
                    { label: 'Exercises', value: String(finishedStats.exerciseCount) },
                    { label: 'Sets', value: String(finishedStats.setCount) },
                    { label: 'Volume', value: `${finishedStats.totalVolume.toLocaleString()} kg` },
                  ].map(({ label, value }) => (
                    <Box key={label} sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{value}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>

                <Chip
                  label={`+${finishedSummary.xp} XP`}
                  sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 800, mb: 2 }}
                />

                <Divider sx={{ mb: 1.5 }} />

                {finishedSummary.exercises.map((exercise, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{exercise.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {exerciseVolume(exercise).toLocaleString()} kg volume
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {exercise.sets.map((s, si) => (
                        <Chip key={si}
                          label={`${s.reps}${s.weightKg ? `×${s.weightKg}kg` : ''}${s.rpe ? ` RPE${s.rpe}` : ''}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', height: 22, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained" fullWidth onClick={() => setFinishedSummary(null)}
              sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
