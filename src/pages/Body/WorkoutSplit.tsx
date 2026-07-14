import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, Button, TextField, Chip, Autocomplete, Snackbar, Alert } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addSplitExercise, removeSplitExercise, saveWorkoutSplitAsync } from '../../store/workoutSplitSlice'
import { registerExercisesIfNewAsync } from '../../store/customExercisesSlice'
import { selectWorkoutSplit, selectExerciseOptions } from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'
import { WEEKDAYS, WEEKDAY_LABELS, type WeekDay } from '../../lib/db/workoutSplit'

function DayCard({ day }: { day: WeekDay }) {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const split = useAppSelector(selectWorkoutSplit)
  const exerciseOptions = useAppSelector(selectExerciseOptions)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const name = input.trim()
    if (!name) return
    dispatch(addSplitExercise({ day, name }))
    if (user) dispatch(registerExercisesIfNewAsync({ userId: user.id, names: [name] }))
    setInput('')
  }

  return (
    <Card sx={{ p: 2, mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{WEEKDAY_LABELS[day]}</Typography>

      {split[day].length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {split[day].map((name, i) => (
            <Chip
              key={i}
              label={name}
              size="small"
              onDelete={() => dispatch(removeSplitExercise({ day, index: i }))}
              sx={{ bgcolor: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Autocomplete
          freeSolo
          options={exerciseOptions}
          inputValue={input}
          onInputChange={(_, value) => setInput(value)}
          onChange={(_, value) => value && setInput(value)}
          sx={{ flex: 1 }}
          renderInput={params => (
            <TextField
              {...params}
              label="เพิ่มท่า"
              size="small"
              helperText="พิมพ์ชื่อท่าเองก็ได้ ไม่ต้องมีใน list"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            />
          )}
        />
        <Button variant="outlined" onClick={handleAdd} disabled={!input.trim()}
          sx={{ borderColor: '#22c55e44', color: '#22c55e', px: 1.5, alignSelf: 'flex-start' }}>
          <AddIcon fontSize="small" />
        </Button>
      </Box>
    </Card>
  )
}

export default function WorkoutSplit() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const split = useAppSelector(selectWorkoutSplit)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!user) return
    dispatch(saveWorkoutSplitAsync({ userId: user.id, days: split }))
    setSaved(true)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body/workout')} sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>Back</Button>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Workout Split</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        กำหนดท่าประจำแต่ละวัน — ตอนกด Start Workout จะดึงท่าของวันนั้นมาให้อัตโนมัติ
      </Typography>

      {WEEKDAYS.map(day => <DayCard key={day} day={day} />)}

      <Button variant="contained" fullWidth onClick={handleSave}
        sx={{ bgcolor: '#22c55e', color: '#000', fontWeight: 800, mt: 1 }}>
        Save Split
      </Button>

      <Snackbar open={saved} autoHideDuration={2000} onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>Split saved</Alert>
      </Snackbar>
    </Box>
  )
}
