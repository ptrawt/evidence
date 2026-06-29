import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { PILLARS, type Pillar, type PillarConfig } from '../../types'

interface Props {
  value: Pillar
  onChange: (value: Pillar) => void
  pillars?: PillarConfig[]
  columns?: 1 | 2 | 4
}

export default function PillarPicker({ value, onChange, pillars = PILLARS, columns = 2 }: Props) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, v) => { if (v) onChange(v as Pillar) }}
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns === 4 ? 2 : columns}, 1fr)`,
        gap: 1, mt: 0.75, mb: 2.5,
      }}
    >
      {pillars.map(p => (
        <ToggleButton
          key={p.id}
          value={p.id}
          sx={{
            gap: 0.75, fontWeight: 700, fontSize: '0.75rem',
            border: '1px solid rgba(255,255,255,0.08) !important',
            borderRadius: '10px !important',
            '&.Mui-selected': {
              bgcolor: `${p.color}18 !important`,
              borderColor: `${p.color} !important`,
              color: p.color,
            },
          }}
        >
          <Typography fontSize={16}>{p.emoji}</Typography>
          {p.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
