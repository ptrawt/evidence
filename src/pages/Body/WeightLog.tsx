import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, Button, TextField, IconButton, Divider } from '@mui/material'
import { ArrowBack as ArrowBackIcon, DeleteOutlined as DeleteIcon } from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addWeightAsync, deleteWeightAsync } from '../../store/weightSlice'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { selectAllWeight, selectTodayWeight, select7DayAvgWeight, selectLowestWeight, selectStartWeight } from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'

export default function WeightLog() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const allWeight = useAppSelector(selectAllWeight)
  const todayWeight = useAppSelector(selectTodayWeight)
  const avgWeight = useAppSelector(select7DayAvgWeight)
  const lowestWeight = useAppSelector(selectLowestWeight)
  const startWeight = useAppSelector(selectStartWeight)

  const [weight, setWeight] = useState(todayWeight ? String(todayWeight.weight) : '')
  const today = new Date().toISOString().slice(0, 10)

  const handleLog = () => {
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0 || !user) return
    const entry = { id: nanoid(), date: today, weight: w, createdAt: new Date().toISOString() }
    dispatch(addWeightAsync({ userId: user.id, entry }))
    dispatch(addEvidenceAsync({
      userId: user.id,
      entry: { id: nanoid(), pillar: 'body', category: 'Weight', xp: 8, note: `${w} kg`, createdAt: new Date().toISOString() },
    }))
    setWeight('')
  }

  const startW = startWeight?.weight ?? null
  const latestW = allWeight.length > 0 ? allWeight[allWeight.length - 1].weight : null

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')} sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>Back</Button>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Weight Log</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Typography>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          {todayWeight ? 'อัปเดตน้ำหนักวันนี้' : 'ชั่งน้ำหนักวันนี้'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="น้ำหนัก (kg)" value={weight} type="number"
            onChange={e => setWeight(e.target.value)}
            slotProps={{ htmlInput: { step: '0.1', min: '0' } }}
            size="small" sx={{ flex: 1 }}
          />
          <Button variant="contained" disabled={!weight} onClick={handleLog}
            sx={{ bgcolor: '#22c55e', color: '#000', fontWeight: 700, px: 3 }}>
            Log
          </Button>
        </Box>
        {todayWeight && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            วันนี้: {todayWeight.weight} kg
          </Typography>
        )}
      </Card>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Stats</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {[
            { label: '7-day Avg', value: avgWeight ? `${avgWeight.toFixed(1)} kg` : '—' },
            { label: 'Lowest', value: lowestWeight ? `${lowestWeight.weight} kg` : '—' },
            { label: 'Start', value: startW ? `${startW} kg` : '—' },
            { label: 'Change', value: startW && latestW ? `${(latestW - startW) > 0 ? '+' : ''}${(latestW - startW).toFixed(1)} kg` : '—' },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ width: '50%', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {allWeight.length > 0 && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>ประวัติ</Typography>
          <Card sx={{ mt: 1 }}>
            {[...allWeight].reverse().map((e, i) => (
              <Box key={e.id}>
                {i > 0 && <Divider />}
                <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{e.weight} kg</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(e.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => dispatch(deleteWeightAsync(e.id))}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Card>
        </>
      )}
    </Box>
  )
}
