import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, Button, IconButton, CircularProgress,
  Dialog, DialogContent, Chip, TextField, Divider,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutlined as DeleteIcon,
  AddAPhoto as CameraIcon,
  CompareOutlined as CompareIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loadPhotos, uploadPhotoAsync, deletePhotoAsync } from '../../store/photosSlice'
import { useAuth } from '../../contexts/AuthContext'
import type { ProgressPhoto } from '../../lib/db/photos'

// ── group by month ────────────────────────────────────────────────────────

function groupByMonth(photos: ProgressPhoto[]) {
  const map = new Map<string, ProgressPhoto[]>()
  photos.forEach(p => {
    const key = p.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  })
  return [...map.entries()]
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
}

// ── Photo thumb ───────────────────────────────────────────────────────────

function PhotoThumb({ photo, onTap }: { photo: ProgressPhoto; onTap: () => void }) {
  return (
    <Box
      onClick={onTap}
      sx={{
        position: 'relative', cursor: 'pointer', borderRadius: 2, overflow: 'hidden',
        aspectRatio: '3/4', bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Box
        component="img"
        src={photo.signedUrl}
        alt={photo.date}
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        p: 1, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      }}>
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}>
          {new Date(photo.date + 'T12:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
        </Typography>
        {photo.note && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '0.6rem' }} noWrap>
            {photo.note}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// ── Compare view ─────────────────────────────────────────────────────────

function CompareView({
  photos, open, onClose,
}: {
  photos: ProgressPhoto[]
  open: boolean
  onClose: () => void
}) {
  const [beforeIdx, setBeforeIdx] = useState(photos.length - 1)
  const [afterIdx, setAfterIdx] = useState(0)

  useEffect(() => {
    if (photos.length >= 2) {
      setBeforeIdx(photos.length - 1)
      setAfterIdx(0)
    }
  }, [photos.length])

  if (photos.length < 2) return null

  const before = photos[beforeIdx]
  const after = photos[afterIdx]

  return (
    <Dialog open={open} onClose={onClose} fullScreen
      PaperProps={{ sx: { bgcolor: '#000', backgroundImage: 'none' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography fontWeight={800}>🔄 Before / After</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Before */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip label="BEFORE" size="small" sx={{ bgcolor: '#ef444420', color: '#ef4444', fontWeight: 800, fontSize: '0.6rem' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {new Date(before.date + 'T12:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Box component="img" src={before.signedUrl} alt="before"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          {/* Date picker */}
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 0.75, p: 1 }}>
            {photos.map((p, i) => (
              <Chip
                key={p.id} size="small"
                label={new Date(p.date + 'T12:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                onClick={() => setBeforeIdx(i)}
                sx={{
                  flexShrink: 0, cursor: 'pointer', fontSize: '0.6rem',
                  bgcolor: beforeIdx === i ? '#ef444420' : 'rgba(255,255,255,0.06)',
                  color: beforeIdx === i ? '#ef4444' : 'text.secondary',
                  border: beforeIdx === i ? '1px solid #ef444440' : '1px solid transparent',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* After */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip label="AFTER" size="small" sx={{ bgcolor: '#22c55e20', color: '#22c55e', fontWeight: 800, fontSize: '0.6rem' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {new Date(after.date + 'T12:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Box component="img" src={after.signedUrl} alt="after"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 0.75, p: 1 }}>
            {photos.map((p, i) => (
              <Chip
                key={p.id} size="small"
                label={new Date(p.date + 'T12:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                onClick={() => setAfterIdx(i)}
                sx={{
                  flexShrink: 0, cursor: 'pointer', fontSize: '0.6rem',
                  bgcolor: afterIdx === i ? '#22c55e20' : 'rgba(255,255,255,0.06)',
                  color: afterIdx === i ? '#22c55e' : 'text.secondary',
                  border: afterIdx === i ? '1px solid #22c55e40' : '1px solid transparent',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}

// ── Detail dialog ─────────────────────────────────────────────────────────

function PhotoDetail({
  photo, onClose, onDelete,
}: {
  photo: ProgressPhoto | null
  onClose: () => void
  onDelete: (p: ProgressPhoto) => void
}) {
  if (!photo) return null
  return (
    <Dialog open={!!photo} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: '#0a0a0a', backgroundImage: 'none' } }}>
      <Box sx={{ position: 'relative' }}>
        <Box component="img" src={photo.signedUrl} alt={photo.date}
          sx={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {new Date(photo.date + 'T12:00').toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
          {photo.note && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{photo.note}</Typography>}
        </Box>
        <IconButton onClick={() => { onDelete(photo); onClose() }}
          sx={{ color: 'error.main' }}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Dialog>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function ProgressPhotos() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { photos, status, uploading } = useAppSelector(s => s.photos)

  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selected, setSelected] = useState<ProgressPhoto | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)

  useEffect(() => {
    if (user && status === 'idle') dispatch(loadPhotos(user.id))
  }, [user, status, dispatch])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setNote('')
    setNoteOpen(true)
    e.target.value = ''
  }

  const handleUpload = () => {
    if (!pendingFile || !user) return
    const today = new Date().toISOString().slice(0, 10)
    dispatch(uploadPhotoAsync({ userId: user.id, file: pendingFile, date: today, note }))
    setPendingFile(null)
    setNoteOpen(false)
  }

  const handleDelete = (photo: ProgressPhoto) => {
    if (!user) return
    dispatch(deletePhotoAsync({ id: photo.id, storagePath: photo.storagePath }))
  }

  const grouped = groupByMonth(photos)

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/body')}
        sx={{ color: 'text.secondary', mb: 2, ml: -1 }}>
        Back
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>📸 Progress Photos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {photos.length} รูป · ถ่ายทุก 2 สัปดาห์
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {photos.length >= 2 && (
            <IconButton onClick={() => setCompareOpen(true)}
              sx={{ color: '#f59e0b', border: '1px solid #f59e0b44' }}>
              <CompareIcon />
            </IconButton>
          )}
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <CameraIcon />}
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}
          >
            {uploading ? 'Uploading...' : 'Add Photo'}
          </Button>
        </Box>
      </Box>

      <input
        ref={fileRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }} onChange={handleFileChange}
      />

      {/* Loading */}
      {status === 'loading' && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      )}

      {/* Empty */}
      {status === 'ready' && photos.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography fontSize={40} sx={{ mb: 1 }}>📸</Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>ยังไม่มีรูป</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            ถ่ายรูปทุก 2 สัปดาห์เพื่อเห็น progress ของตัวเอง
          </Typography>
          <Button variant="outlined" startIcon={<CameraIcon />} onClick={() => fileRef.current?.click()}
            sx={{ borderColor: 'primary.main', color: 'primary.main' }}>
            ถ่ายรูปแรก
          </Button>
        </Card>
      )}

      {/* Grouped grid */}
      {grouped.map(([month, monthPhotos]) => (
        <Box key={month} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
              {monthLabel(month)}
            </Typography>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{monthPhotos.length} รูป</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {monthPhotos.map(photo => (
              <PhotoThumb key={photo.id} photo={photo} onTap={() => setSelected(photo)} />
            ))}
          </Box>
        </Box>
      ))}

      {/* Note dialog before upload */}
      <Dialog open={noteOpen} onClose={() => { setNoteOpen(false); setPendingFile(null) }}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>📸 Add Note</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {pendingFile?.name} · วันนี้
          </Typography>
          <TextField
            fullWidth autoFocus
            label="Note (optional)"
            placeholder="e.g. Week 4, after cut phase..."
            value={note}
            onChange={e => setNote(e.target.value)}
            size="small"
            onKeyDown={e => e.key === 'Enter' && handleUpload()}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
            <Button onClick={() => { setNoteOpen(false); setPendingFile(null) }}
              sx={{ color: 'text.secondary', flex: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpload}
              sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, flex: 2 }}>
              Upload
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Photo detail */}
      <PhotoDetail photo={selected} onClose={() => setSelected(null)} onDelete={handleDelete} />

      {/* Compare */}
      <CompareView photos={photos} open={compareOpen} onClose={() => setCompareOpen(false)} />
    </Box>
  )
}
