import { Box, Typography, Grid } from '@mui/material'
import PillarCard from '../../components/PillarCard/PillarCard'
import { PILLARS } from '../../types'

export default function Pillars() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Four Pillars
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Every dimension of who you're becoming
      </Typography>

      <Grid container spacing={2}>
        {PILLARS.map(pillar => (
          <Grid size={{ xs: 12, sm: 6 }} key={pillar.id}>
            <PillarCard pillar={pillar} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
