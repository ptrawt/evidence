import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

function formatElapsed(startedAt: string): string {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Isolated so the once-a-second tick only re-renders this leaf, not the whole
// active-workout subtree (exercise cards, etc.) that WorkoutLog renders.
export default function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAt))

  useEffect(() => {
    setElapsed(formatElapsed(startedAt))
    const id = setInterval(() => setElapsed(formatElapsed(startedAt)), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return <Typography variant="h5" sx={{ fontWeight: 800, color: '#22c55e' }}>{elapsed}</Typography>
}
