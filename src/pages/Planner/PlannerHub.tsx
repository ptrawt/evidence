import { useState, useMemo } from 'react'
import {
  Box, Typography, Card, Button, Chip, IconButton, Checkbox, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material'
import {
  DeleteOutlined as DeleteIcon,
  Add as AddIcon,
  LinkOutlined as LinkIcon,
  FitnessCenterOutlined as GymIcon,
  TaskAltOutlined as TaskIcon,
} from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addPlanItemAsync, togglePlanItemAsync, deletePlanItemAsync } from '../../store/plannerSlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { useAuth } from '../../contexts/AuthContext'
import { PILLARS, type Pillar } from '../../types'
import PillarPicker from '../../components/PillarPicker/PillarPicker'
import type { Exercise, PlanItem } from '../../lib/db/planner'

// ── helpers ────────────────────────────────────────────────────────────────

function getWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday); x.setDate(monday.getDate() + i); return x
  })
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const toISO = (d: Date) => d.toISOString().slice(0, 10)

// ── Exercise row editor ─────────────────────────────────────────────────────

function ExerciseRow({
  ex, onChange, onDelete,
}: {
  ex: Exercise
  onChange: (patch: Partial<Exercise>) => void
  onDelete: () => void
}) {
  return (
    <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small" placeholder="Exercise name" value={ex.name} fullWidth
          onChange={e => onChange({ name: e.target.value })}
        />
        <IconButton size="small" onClick={onDelete} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small" label="Sets" type="number" value={ex.sets}
          onChange={e => onChange({ sets: Number(e.target.value) })}
          sx={{ width: 70 }} slotProps={{ htmlInput: { min: 1 } }}
        />
        <TextField
          size="small" label="Reps" type="number" value={ex.reps}
          onChange={e => onChange({ reps: Number(e.target.value) })}
          sx={{ width: 70 }} slotProps={{ htmlInput: { min: 1 } }}
        />
        <TextField
          size="small" label="kg" type="number" value={ex.weightKg ?? ''}
          onChange={e => onChange({ weightKg: e.target.value ? Number(e.target.value) : undefined })}
          sx={{ width: 70 }} slotProps={{ htmlInput: { min: 0, step: '0.5' } }}
        />
      </Box>
      <TextField
        size="small" placeholder="Video URL (optional)" fullWidth value={ex.videoUrl ?? ''}
        onChange={e => onChange({ videoUrl: e.target.value || undefined })}
        sx={{ mt: 1 }}
      />
    </Box>
  )
}

// ── Plan item card ──────────────────────────────────────────────────────────

function PlanItemCard({ item }: { item: PlanItem }) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const pillar = PILLARS.find(p => p.id === item.pillar)!

  const handleToggle = () => {
    const next = !item.completed
    dispatch(togglePlanItemAsync({ id: item.id, completed: next }))
    if (next && user) {
      dispatch(addEvidenceAsync({
        userId: user.id,
        entry: {
          id: nanoid(), pillar: item.pillar,
          category: item.type === 'workout' ? '🏋️ Workout' : '✅ Task',
          xp: item.type === 'workout' ? 15 : 8,
          note: item.title,
          createdAt: new Date().toISOString(),
        },
      }))
    }
  }

  return (
    <Card sx={{
      mb: 1.5,
      border: item.completed ? `1px solid ${pillar.color}30` : undefined,
      opacity: item.completed ? 0.7 : 1,
    }}>
      <Box sx={{ p: 2 }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={item.completed}
            onChange={handleToggle}
            size="small"
            sx={{ p: 0, mt: 0.25, color: pillar.color, '&.Mui-checked': { color: pillar.color } }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="body2" fontWeight={700}
                sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.secondary' : 'text.primary' }}
              >
                {item.type === 'workout' ? '🏋️ ' : ''}{item.title}
              </Typography>
              <Chip
                label={pillar.label}
                size="small"
                sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${pillar.color}18`, color: pillar.color }}
              />
              <Chip
                label={item.type === 'workout' ? `+15 XP` : `+8 XP`}
                size="small"
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary' }}
              />
            </Box>
            {item.notes && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {item.notes}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => dispatch(deletePlanItemAsync(item.id))}
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, mt: -0.25 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Exercises */}
        {item.exercises.length > 0 && (
          <Box sx={{ mt: 1.5, pl: 3.5 }}>
            {item.exercises.map((ex, i) => (
              <Box key={ex.id}>
                {i > 0 && <Divider sx={{ my: 0.75 }} />}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{ex.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {ex.sets}×{ex.reps}{ex.weightKg ? ` · ${ex.weightKg}kg` : ''}
                    </Typography>
                  </Box>
                  {ex.videoUrl && (
                    <IconButton
                      size="small" component="a" href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                      sx={{ color: '#3b82f6' }}
                    >
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

type DialogType = 'task' | 'workout' | null

export default function PlannerHub() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const allItems = useAppSelector(s => s.planner.items)

  const today = new Date()
  const [anchor, setAnchor] = useState(today)
  const [selectedDate, setSelectedDate] = useState(toISO(today))
  const [dialogType, setDialogType] = useState<DialogType>(null)

  // Task form
  const [taskPillar, setTaskPillar] = useState<Pillar>('career')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskNotes, setTaskNotes] = useState('')

  // Workout form
  const [workoutTitle, setWorkoutTitle] = useState('')
  const [workoutPillar, setWorkoutPillar] = useState<Pillar>('body')
  const [exercises, setExercises] = useState<Exercise[]>([])

  const weekDays = useMemo(() => getWeekDays(anchor), [anchor])

  const dayItems = useMemo(
    () => allItems.filter(i => i.date === selectedDate),
    [allItems, selectedDate],
  )

  const dotsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    allItems.forEach(i => { map[i.date] = (map[i.date] ?? 0) + 1 })
    return map
  }, [allItems])

  const prevWeek = () => {
    const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d)
  }
  const nextWeek = () => {
    const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d)
  }

  const openDialog = (type: DialogType) => {
    setDialogType(type)
    if (type === 'task') { setTaskTitle(''); setTaskNotes(''); setTaskPillar('career') }
    if (type === 'workout') { setWorkoutTitle(''); setExercises([]); setWorkoutPillar('body') }
  }

  const addExercise = () =>
    setExercises(ex => [...ex, { id: nanoid(), name: '', sets: 3, reps: 10 }])

  const updateExercise = (id: string, patch: Partial<Exercise>) =>
    setExercises(ex => ex.map(e => e.id === id ? { ...e, ...patch } : e))

  const removeExercise = (id: string) =>
    setExercises(ex => ex.filter(e => e.id !== id))

  const handleAddTask = () => {
    if (!taskTitle.trim() || !user) return
    const item: PlanItem = {
      id: nanoid(), date: selectedDate, pillar: taskPillar,
      title: taskTitle.trim(), type: 'task', completed: false,
      notes: taskNotes, exercises: [], createdAt: new Date().toISOString(),
    }
    dispatch(addPlanItemAsync({ userId: user.id, item }))
    setDialogType(null)
  }

  const handleAddWorkout = () => {
    if (!workoutTitle.trim() || !user) return
    const item: PlanItem = {
      id: nanoid(), date: selectedDate, pillar: workoutPillar,
      title: workoutTitle.trim(), type: 'workout', completed: false,
      notes: '', exercises: exercises.filter(e => e.name.trim()),
      createdAt: new Date().toISOString(),
    }
    dispatch(addPlanItemAsync({ userId: user.id, item }))
    setDialogType(null)
  }

  const weekLabel = (() => {
    const start = weekDays[0]
    const end = weekDays[6]
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  })()

  const selectedDateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>📅 Planner</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          วาง sessions ล่วงหน้า · workouts & tasks เฉพาะวัน
        </Typography>
      </Box>

      {/* Week nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={prevWeek} size="small" sx={{ color: 'text.secondary' }}>‹</IconButton>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{weekLabel}</Typography>
        <IconButton onClick={nextWeek} size="small" sx={{ color: 'text.secondary' }}>›</IconButton>
      </Box>

      {/* Day strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75, mb: 3 }}>
        {weekDays.map((d, i) => {
          const iso = toISO(d)
          const isToday = iso === toISO(today)
          const isSelected = iso === selectedDate
          const count = dotsByDate[iso] ?? 0
          return (
            <Box
              key={iso}
              onClick={() => setSelectedDate(iso)}
              sx={{
                cursor: 'pointer', textAlign: 'center', py: 1, borderRadius: 2,
                border: isSelected ? '1px solid' : '1px solid transparent',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                bgcolor: isSelected ? 'rgba(245,158,11,0.10)' : isToday ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>
                {DAY_LABELS[i]}
              </Typography>
              <Typography variant="body2" fontWeight={isToday || isSelected ? 800 : 400}
                sx={{ color: isSelected ? 'primary.main' : isToday ? 'text.primary' : 'text.secondary', lineHeight: 1.6 }}>
                {d.getDate()}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.4, mt: 0.25, minHeight: 6 }}>
                {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                  <Box key={j} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.7 }} />
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Selected day */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>{selectedDateLabel}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>📌 เฉพาะวันนี้ · ไม่ซ้ำทุกวัน</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small" startIcon={<TaskIcon />}
            onClick={() => openDialog('task')}
            sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.12)', border: '1px solid' }}
          >
            Task
          </Button>
          <Button
            size="small" startIcon={<GymIcon />}
            onClick={() => openDialog('workout')}
            sx={{ color: '#f59e0b', borderColor: '#f59e0b44', border: '1px solid' }}
          >
            Workout
          </Button>
        </Box>
      </Box>

      {dayItems.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>ยังไม่มีแผนสำหรับวันนี้</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>กด Task หรือ Workout เพื่อ schedule เฉพาะวันนี้</Typography>
        </Card>
      ) : (
        dayItems.map(item => <PlanItemCard key={item.id} item={item} />)
      )}

      {/* Task Dialog */}
      <Dialog open={dialogType === 'task'} onClose={() => setDialogType(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>✅ Add Task</DialogTitle>
        <DialogContent>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Pillar</Typography>
          <PillarPicker value={taskPillar} onChange={setTaskPillar} />

          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Title</Typography>
          <TextField
            fullWidth autoFocus value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="e.g. Review PR, Read chapter 3..."
            size="small" sx={{ mt: 0.75, mb: 2 }}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
          />

          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Notes</Typography>
          <TextField
            fullWidth multiline rows={2} value={taskNotes}
            onChange={e => setTaskNotes(e.target.value)}
            placeholder="Details..."
            size="small" sx={{ mt: 0.75 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogType(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" disabled={!taskTitle.trim()} onClick={handleAddTask}
            sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, flex: 1 }}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workout Dialog */}
      <Dialog open={dialogType === 'workout'} onClose={() => setDialogType(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>🏋️ Add Workout</DialogTitle>
        <DialogContent>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Pillar</Typography>
          <PillarPicker value={workoutPillar} onChange={setWorkoutPillar} />

          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Workout Name</Typography>
          <TextField
            fullWidth autoFocus value={workoutTitle}
            onChange={e => setWorkoutTitle(e.target.value)}
            placeholder="e.g. Push Day, Legs, Full Body..."
            size="small" sx={{ mt: 0.75, mb: 2.5 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Exercises</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addExercise}
              sx={{ color: 'primary.main', minWidth: 0 }}>
              Add
            </Button>
          </Box>

          {exercises.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2, border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>กด Add เพื่อเพิ่ม exercise</Typography>
            </Box>
          ) : (
            exercises.map(ex => (
              <ExerciseRow
                key={ex.id} ex={ex}
                onChange={patch => updateExercise(ex.id, patch)}
                onDelete={() => removeExercise(ex.id)}
              />
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogType(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" disabled={!workoutTitle.trim()} onClick={handleAddWorkout}
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, flex: 1 }}>
            Add Workout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
