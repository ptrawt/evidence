import { Box, Typography, Divider } from '@mui/material'
import { useAppSelector } from '../../store/hooks'
import { selectAllEntries, selectEvidenceCount } from '../../store/selectors'
import EvidenceCard from '../../components/EvidenceCard/EvidenceCard'

function groupByDate(entries: ReturnType<typeof selectAllEntries>) {
  const groups: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10)
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

export default function Timeline() {
  const entries = useAppSelector(selectAllEntries)
  const totalCount = useAppSelector(selectEvidenceCount)
  const grouped = groupByDate(entries)

  if (entries.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', pt: 8 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>📜</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          No evidence yet
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Your journey will appear here
        </Typography>
      </Box>
    )
  }

  // Precompute sequential index for each entry (newest = totalCount, oldest = 1)
  const indexById = new Map(
    grouped.flatMap(([, dayEntries]) => dayEntries).map((e, i) => [e.id, totalCount - i])
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Timeline
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {totalCount} evidence collected
      </Typography>

      {grouped.map(([date, dayEntries]) => {
        const d = new Date(date)
        const label = d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        const dayXP = dayEntries.reduce((s, e) => s + e.xp, 0)

        return (
          <Box key={date} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>+{dayXP} XP</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {dayEntries.map((entry) => (
                <EvidenceCard key={entry.id} entry={entry} index={indexById.get(entry.id) ?? 0} showDelete />
              ))}
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        )
      })}
    </Box>
  )
}
