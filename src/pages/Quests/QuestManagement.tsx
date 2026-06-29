import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, IconButton, Button, TextField,
  Chip, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, Slider,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutlined as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addQuestAsync, deleteQuestAsync } from '../../store/questsSlice'
import { selectQuestsByPillar } from '../../store/questSelectors'
import { useAuth } from '../../contexts/AuthContext'
import { PILLARS, type Pillar } from '../../types'
import PillarPicker from '../../components/PillarPicker/PillarPicker'
import type { Quest } from '../../types/quest'

function PillarQuestList({ pillar }: { pillar: typeof PILLARS[0] }) {
  const dispatch = useAppDispatch()
  const questsSelector = useMemo(() => selectQuestsByPillar(pillar.id as Pillar), [pillar.id])
  const quests = useAppSelector(questsSelector)

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography fontSize={18}>{pillar.emoji}</Typography>
        <Typography variant="subtitle2" fontWeight={700}>{pillar.label}</Typography>
        <Chip
          label={quests.length}
          size="small"
          sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary' }}
        />
      </Box>

      {quests.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', pl: 0.5, fontStyle: 'italic' }}>
          No quests yet
        </Typography>
      ) : (
        <Card>
          {quests.map((q, i) => (
            <Box key={q.id}>
              {i > 0 && <Divider />}
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>{q.name}</Typography>
                </Box>
                <Chip
                  label={`+${q.xp} XP`}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 700, mr: 1,
                    bgcolor: `${pillar.color}18`, color: pillar.color,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => dispatch(deleteQuestAsync(q.id))}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Card>
      )}
    </Box>
  )
}

export default function QuestManagement() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [pillar, setPillar] = useState<Pillar>('career')
  const [name, setName] = useState('')
  const [xp, setXp] = useState(10)

  const handleAdd = () => {
    if (!name.trim() || !user) return
    const quest: Quest = {
      id: nanoid(),
      pillar,
      name: name.trim(),
      xp,
      isPreset: false,
      sortOrder: 999,
      createdAt: new Date().toISOString(),
    }
    dispatch(addQuestAsync({ userId: user.id, quest }))
    setName('')
    setXp(10)
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setName('')
    setXp(10)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ color: 'text.secondary', mb: 2, ml: -1 }}
      >
        Back
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.25 }}>🔄 Daily Habits</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            ปรากฏใน Today ทุกวัน · เช็คแล้วได้ XP
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, flexShrink: 0 }}
        >
          Add Habit
        </Button>
      </Box>

      {PILLARS.map(pillar => (
        <PillarQuestList key={pillar.id} pillar={pillar} />
      ))}

      {/* Add Quest Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>New Daily Habit</DialogTitle>
        <DialogContent>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            Pillar
          </Typography>
          <PillarPicker value={pillar} onChange={setPillar} />

          {/* Name */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            Quest Name
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. Push Day, Read 30 min..."
            value={name}
            onChange={e => setName(e.target.value)}
            size="small"
            sx={{ mt: 0.75, mb: 2.5 }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />

          {/* XP */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
            XP Reward
          </Typography>
          <Box sx={{ px: 1, mt: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Experience Points</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'primary.main' }}>
                +{xp} XP
              </Typography>
            </Box>
            <Slider
              value={xp}
              onChange={(_, v) => setXp(v as number)}
              min={1}
              max={30}
              marks={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 20, label: '20' },
              ]}
              sx={{
                color: PILLARS.find(p => p.id === pillar)?.color ?? 'primary.main',
                '& .MuiSlider-markLabel': { fontSize: '0.65rem', color: 'text.secondary' },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!name.trim()}
            onClick={handleAdd}
            sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, flex: 1 }}
          >
            Add Quest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
