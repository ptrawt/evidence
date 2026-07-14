import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Button, TextField, Chip,
  Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Divider, Snackbar, Alert,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon, ExpandMore as ExpandMoreIcon,
  DeleteOutlined as DeleteIcon, Edit as EditIcon, Add as AddIcon, DownloadDone as ImportIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { saveExerciseInfoAsync, importExerciseInfoAsync, deleteExerciseInfoAsync } from '../../store/exerciseInfoSlice'
import { registerExercisesIfNewAsync } from '../../store/customExercisesSlice'
import { selectExerciseInfo } from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'
import { DIALOG_PAPER_SX } from '../../lib/constants'
import {
  EXERCISE_TYPES, EXERCISE_PRIORITIES, difficultyStars,
  type ExerciseInfo, type ExerciseInfoDetails, type ExerciseType, type ExercisePriority,
} from '../../lib/exerciseInfo'
import { FITNESS_FIRST_THAPRA_SEED } from '../../lib/exerciseInfoSeed'

const PRIORITY_COLOR: Record<ExercisePriority, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#6b7280' }

const linesToArray = (text: string): string[] => text.split('\n').map(s => s.trim()).filter(Boolean)
const arrayToLines = (arr?: string[]): string => (arr ?? []).join('\n')

const emptyDraft = (): ExerciseInfo => ({
  exerciseName: '', category: '', type: 'Compound', difficulty: 1, priority: 'Medium', details: {},
})

function ArrayField({ label, value, minRows = 2, onChange }: {
  label: string; value?: string[]; minRows?: number; onChange: (v: string[]) => void
}) {
  return (
    <TextField label={label} value={arrayToLines(value)} size="small" fullWidth multiline minRows={minRows}
      onChange={e => onChange(linesToArray(e.target.value))} />
  )
}

function ExerciseEditorDialog({
  open, initial, isNew, onClose, onSave,
}: {
  open: boolean
  initial: ExerciseInfo
  isNew: boolean
  onClose: () => void
  onSave: (info: ExerciseInfo) => void
}) {
  const [exerciseName, setExerciseName] = useState(initial.exerciseName)
  const [category, setCategory] = useState(initial.category)
  const [type, setType] = useState<ExerciseType>(initial.type)
  const [difficulty, setDifficulty] = useState(initial.difficulty)
  const [priority, setPriority] = useState<ExercisePriority>(initial.priority)
  const [d, setD] = useState<ExerciseInfoDetails>(initial.details)

  const set = <K extends keyof ExerciseInfoDetails>(key: K, value: ExerciseInfoDetails[K]) =>
    setD(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    if (!exerciseName.trim()) return
    onSave({ exerciseName: exerciseName.trim(), category, type, difficulty, priority, details: d })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: DIALOG_PAPER_SX } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{isNew ? 'Add Exercise Info' : `Edit: ${initial.exerciseName}`}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField label="Exercise Name" value={exerciseName} size="small" fullWidth
          disabled={!isNew} onChange={e => setExerciseName(e.target.value)} />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Category" value={category} size="small" fullWidth
            onChange={e => setCategory(e.target.value)} placeholder="Legs, Push, Pull, Core..." />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={e => setType(e.target.value as ExerciseType)}>
              {EXERCISE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select label="Difficulty" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>
              <MenuItem value={1}>⭐ Beginner</MenuItem>
              <MenuItem value={2}>⭐⭐ Intermediate</MenuItem>
              <MenuItem value={3}>⭐⭐⭐ Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priority} onChange={e => setPriority(e.target.value as ExercisePriority)}>
              {EXERCISE_PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TextField label="Status" value={d.status ?? ''} size="small" fullWidth
          onChange={e => set('status', e.target.value)} placeholder="✅ Verified / 📸 Need photo" />
        <TextField label="Benefits (ประโยชน์)" value={d.benefits ?? ''} size="small" fullWidth multiline minRows={2}
          onChange={e => set('benefits', e.target.value)} />
        <ArrayField label="Primary Muscle (บรรทัดละ 1)" value={d.primaryMuscle} onChange={v => set('primaryMuscle', v)} />
        <ArrayField label="Secondary Muscle (บรรทัดละ 1)" value={d.secondaryMuscle} onChange={v => set('secondaryMuscle', v)} />
        <ArrayField label="Muscle Cues (บรรทัดละ 1)" value={d.muscleCues} onChange={v => set('muscleCues', v)} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <ArrayField label="Should Feel (บรรทัดละ 1)" value={d.feelShould} onChange={v => set('feelShould', v)} />
          <ArrayField label="Should NOT Feel (บรรทัดละ 1)" value={d.feelShouldNot} onChange={v => set('feelShouldNot', v)} />
        </Box>
        <ArrayField label="How To — วิธีเล่น (บรรทัดละ 1 ขั้นตอน)" value={d.howTo} minRows={3} onChange={v => set('howTo', v)} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="ROM — ลงจน" value={d.romDown ?? ''} size="small" fullWidth
            onChange={e => set('romDown', e.target.value)} />
          <TextField label="ROM — ขึ้นจน" value={d.romUp ?? ''} size="small" fullWidth
            onChange={e => set('romUp', e.target.value)} />
        </Box>
        <ArrayField label="Common Mistakes (บรรทัดละ 1)" value={d.commonMistakes} onChange={v => set('commonMistakes', v)} />
        <ArrayField label="จุดปรับ (บรรทัดละ 1)" value={d.adjustmentPoints} onChange={v => set('adjustmentPoints', v)} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="หายใจออก" value={d.breathingOut ?? ''} size="small" fullWidth
            onChange={e => set('breathingOut', e.target.value)} />
          <TextField label="หายใจเข้า" value={d.breathingIn ?? ''} size="small" fullWidth
            onChange={e => set('breathingIn', e.target.value)} />
        </Box>
        <ArrayField label="ข้อควรระวัง (บรรทัดละ 1)" value={d.cautions} onChange={v => set('cautions', v)} />
        <ArrayField label="Setup Checklist (บรรทัดละ 1)" value={d.setupChecklist} onChange={v => set('setupChecklist', v)} />
        <TextField label="Use in Workout" value={d.useInWorkout ?? ''} size="small" fullWidth multiline minRows={2}
          onChange={e => set('useInWorkout', e.target.value)} />
        <TextField label="My Setting (Seat/Weight/Reps/Note)" value={d.mySetting ?? ''} size="small" fullWidth
          onChange={e => set('mySetting', e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!exerciseName.trim()}
          sx={{ bgcolor: '#22c55e', color: '#000', fontWeight: 700 }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function InfoList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>{title}</Typography>
      {items.map((item, i) => (
        <Typography key={i} variant="body2" sx={{ mb: 0.25 }}>• {item}</Typography>
      ))}
    </Box>
  )
}

function ExerciseDetailCard({ info, onEdit, onDelete }: { info: ExerciseInfo; onEdit: () => void; onDelete: () => void }) {
  const d = info.details
  return (
    <Accordion sx={{ mb: 1, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{info.exerciseName}</Typography>
          <Chip label={info.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', height: 20, fontSize: '0.65rem' }} />
          <Chip label={info.type} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', height: 20, fontSize: '0.65rem' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{difficultyStars(info.difficulty)}</Typography>
          <Chip label={info.priority} size="small"
            sx={{ bgcolor: `${PRIORITY_COLOR[info.priority]}22`, color: PRIORITY_COLOR[info.priority], height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={onEdit} sx={{ color: 'primary.main' }}>Edit</Button>
          <Button size="small" startIcon={<DeleteIcon fontSize="small" />} onClick={onDelete} sx={{ color: 'error.main' }}>Delete</Button>
        </Box>
        {d.status && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{d.status}</Typography>}
        {d.benefits && <Typography variant="body2" sx={{ mb: 1.5 }}>{d.benefits}</Typography>}
        <InfoList title="Primary Muscle" items={d.primaryMuscle} />
        <InfoList title="Secondary Muscle" items={d.secondaryMuscle} />
        <InfoList title="Muscle Cue" items={d.muscleCues} />
        <InfoList title="✅ ควรรู้สึก" items={d.feelShould} />
        <InfoList title="❌ ไม่ควรรู้สึก" items={d.feelShouldNot} />
        {d.howTo && d.howTo.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>วิธีเล่น</Typography>
            {d.howTo.map((step, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 0.25 }}>{i + 1}. {step}</Typography>
            ))}
          </Box>
        )}
        {(d.romDown || d.romUp) && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>ROM</Typography>
            {d.romDown && <Typography variant="body2">ลงจน: {d.romDown}</Typography>}
            {d.romUp && <Typography variant="body2">ขึ้นจน: {d.romUp}</Typography>}
          </Box>
        )}
        <InfoList title="❌ Common Mistakes" items={d.commonMistakes} />
        <InfoList title="จุดปรับ" items={d.adjustmentPoints} />
        {(d.breathingOut || d.breathingIn) && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>การหายใจ</Typography>
            {d.breathingOut && <Typography variant="body2">ออกแรง: หายใจออก ({d.breathingOut})</Typography>}
            {d.breathingIn && <Typography variant="body2">ผ่อนแรง: หายใจเข้า ({d.breathingIn})</Typography>}
          </Box>
        )}
        <InfoList title="⚠️ ข้อควรระวัง" items={d.cautions} />
        <InfoList title="Setup Checklist" items={d.setupChecklist} />
        {d.useInWorkout && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>Use in Workout</Typography>
            <Typography variant="body2">{d.useInWorkout}</Typography>
          </Box>
        )}
        {d.mySetting && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>My Setting</Typography>
            <Typography variant="body2">{d.mySetting}</Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default function ExerciseLibrary() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const infoMap = useAppSelector(selectExerciseInfo)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [editing, setEditing] = useState<{ info: ExerciseInfo; isNew: boolean } | null>(null)
  const [imported, setImported] = useState(false)

  const allInfo = Object.values(infoMap)
  const categories = Array.from(new Set(allInfo.map(i => i.category))).filter(Boolean).sort()

  const filtered = allInfo
    .filter(i => !search.trim() || i.exerciseName.toLowerCase().includes(search.trim().toLowerCase()))
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)
    .filter(i => priorityFilter === 'all' || i.priority === priorityFilter)
    .sort((a, b) => {
      const order: Record<ExercisePriority, number> = { High: 0, Medium: 1, Low: 2 }
      return order[a.priority] - order[b.priority] || a.exerciseName.localeCompare(b.exerciseName)
    })

  const handleSave = (info: ExerciseInfo) => {
    if (!user) return
    dispatch(saveExerciseInfoAsync({ userId: user.id, info }))
    dispatch(registerExercisesIfNewAsync({ userId: user.id, names: [info.exerciseName] }))
    setEditing(null)
  }

  const handleDelete = (exerciseName: string) => {
    if (!user) return
    if (!window.confirm(`ลบข้อมูล "${exerciseName}"?`)) return
    dispatch(deleteExerciseInfoAsync({ userId: user.id, exerciseName }))
  }

  const handleImportSeed = () => {
    if (!user) return
    dispatch(importExerciseInfoAsync({ userId: user.id, infos: FITNESS_FIRST_THAPRA_SEED }))
    dispatch(registerExercisesIfNewAsync({ userId: user.id, names: FITNESS_FIRST_THAPRA_SEED.map(i => i.exerciseName) }))
    setImported(true)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')} sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>Back</Button>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>📖 Exercise Library</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        ชีทสรุปวิธีเล่นแต่ละท่า — ดูได้ระหว่างเล่นเวท ไม่ต้องเปิด Notion
      </Typography>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Button variant="outlined" fullWidth startIcon={<ImportIcon />} onClick={handleImportSeed}
            sx={{ borderColor: '#22c55e44', color: '#22c55e' }}>
            Import Fitness First Thapra ({FITNESS_FIRST_THAPRA_SEED.length})
          </Button>
        </Box>
        <Button variant="contained" fullWidth startIcon={<AddIcon />}
          onClick={() => setEditing({ info: emptyDraft(), isNew: true })}
          sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>
          Add Exercise
        </Button>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField label="ค้นหาท่า" value={search} size="small" fullWidth sx={{ mb: 1.5 }}
          onChange={e => setSearch(e.target.value)} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {EXERCISE_PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {filtered.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', my: 3 }}>
          ยังไม่มีข้อมูลท่าไหนเลย — ลอง Import หรือ Add Exercise ด้านบน
        </Typography>
      )}

      {filtered.map(info => (
        <ExerciseDetailCard
          key={info.exerciseName}
          info={info}
          onEdit={() => setEditing({ info, isNew: false })}
          onDelete={() => handleDelete(info.exerciseName)}
        />
      ))}

      {editing && (
        <ExerciseEditorDialog
          open
          initial={editing.info}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      <Divider sx={{ my: 1 }} />

      <Snackbar open={imported} autoHideDuration={2500} onClose={() => setImported(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>
          Imported {FITNESS_FIRST_THAPRA_SEED.length} exercises
        </Alert>
      </Snackbar>
    </Box>
  )
}
