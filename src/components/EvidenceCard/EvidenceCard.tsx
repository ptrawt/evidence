import { Box, Card, Typography, Chip, IconButton } from '@mui/material'
import { DeleteOutlined as DeleteOutlineIcon } from '@mui/icons-material'
import { useAppDispatch } from '../../store/hooks'
import { deleteEvidenceAsync } from '../../store/evidenceSlice'
import { PILLARS } from '../../types'
import type { EvidenceEntry } from '../../types'

interface Props {
  entry: EvidenceEntry
  index?: number
  showDelete?: boolean
}

export default function EvidenceCard({ entry, index, showDelete = false }: Props) {
  const dispatch = useAppDispatch()
  const pillar = PILLARS.find(p => p.id === entry.pillar)!

  const date = new Date(entry.createdAt)
  const dateStr = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

  return (
    <Card sx={{ p: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            {index !== undefined && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                #{String(index).padStart(3, '0')}
              </Typography>
            )}
            <Chip
              label={`${pillar.emoji} ${pillar.label}`}
              size="small"
              sx={{ bgcolor: `${pillar.color}22`, color: pillar.color, fontWeight: 700, height: 20, fontSize: '0.7rem' }}
            />
            <Chip
              label={`+${entry.xp} XP`}
              size="small"
              sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 800, height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>{entry.category}</Typography>
          {entry.note && (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{entry.note}</Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75, fontSize: '0.7rem' }}>
            {dateStr} · {timeStr}
          </Typography>
        </Box>
        {showDelete && (
          <IconButton
            size="small"
            onClick={() => dispatch(deleteEvidenceAsync(entry.id))}
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, ml: 1, mt: -0.5 }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Card>
  )
}
