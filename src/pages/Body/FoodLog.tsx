import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Button, TextField, ToggleButton,
  ToggleButtonGroup, IconButton, Divider,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, DeleteOutlined as DeleteIcon } from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addFoodAsync, deleteFoodAsync } from '../../store/foodSlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { selectAllFood } from '../../store/bodySelectors'
import { MEAL_LABELS, MEAL_EMOJI, type Meal } from '../../types/body'
import { useAuth } from '../../contexts/AuthContext'

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function FoodLog() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const allFood = useAppSelector(selectAllFood)

  const [meal, setMeal] = useState<Meal>('breakfast')
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [note, setNote] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const todayFood = allFood.filter(e => e.date === today)

  const handleAdd = () => {
    if (!name || !kcal || !user) return
    const entry = {
      id: nanoid(), date: today, meal, name: name.trim(),
      kcal: Number(kcal), protein: Number(protein) || 0,
      note: note.trim(), createdAt: new Date().toISOString(),
    }
    dispatch(addFoodAsync({ userId: user.id, entry }))
    dispatch(addEvidenceAsync({
      userId: user.id,
      entry: { id: nanoid(), pillar: 'body', category: 'Calories', xp: 5, note: `${name} (${kcal} kcal)`, createdAt: new Date().toISOString() },
    }))
    setName(''); setKcal(''); setProtein(''); setNote('')
  }

  const mealGroups = MEALS.map(m => ({
    meal: m,
    entries: todayFood.filter(e => e.meal === m),
  })).filter(g => g.entries.length > 0)

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')} sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>Back</Button>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Food Log</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Typography>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>เพิ่มอาหาร</Typography>
        <ToggleButtonGroup
          value={meal} exclusive onChange={(_, v) => { if (v) setMeal(v) }}
          size="small" sx={{ mb: 2, display: 'flex' }}
        >
          {MEALS.map(m => (
            <ToggleButton key={m} value={m} sx={{ flex: 1, fontSize: '0.7rem', py: 0.75 }}>
              {MEAL_EMOJI[m]} {MEAL_LABELS[m]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField fullWidth label="ชื่ออาหาร" value={name} onChange={e => setName(e.target.value)} size="small" sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <TextField label="kcal" value={kcal} type="number" onChange={e => setKcal(e.target.value)} size="small" sx={{ flex: 1 }} />
          <TextField label="Protein (g)" value={protein} type="number" onChange={e => setProtein(e.target.value)} size="small" sx={{ flex: 1 }} />
        </Box>
        <TextField fullWidth label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} size="small" sx={{ mb: 2 }} />
        <Button fullWidth variant="contained" disabled={!name || !kcal} onClick={handleAdd}
          sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>
          + Add Food
        </Button>
      </Card>

      {mealGroups.length > 0 && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>วันนี้</Typography>
          {mealGroups.map(({ meal: m, entries }) => (
            <Box key={m} sx={{ mt: 1.5, mb: 2 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary' }}>
                {MEAL_EMOJI[m]} {MEAL_LABELS[m]}
              </Typography>
              <Card sx={{ mt: 0.75 }}>
                {entries.map((e, i) => (
                  <Box key={e.id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{e.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {e.kcal} kcal{e.protein > 0 ? ` · ${e.protein}g protein` : ''}{e.note ? ` · ${e.note}` : ''}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => dispatch(deleteFoodAsync(e.id))}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Card>
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}
