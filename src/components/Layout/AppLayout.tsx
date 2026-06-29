import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, BottomNavigation, BottomNavigationAction, Paper, Typography, IconButton,
} from '@mui/material'
import {
  TodayRounded as TodayIcon,
  GridView as GridViewIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

const NAV_ITEMS = [
  { label: 'Today', icon: <TodayIcon />, path: '/', match: (p: string) => p === '/' },
  { label: 'Pillars', icon: <GridViewIcon />, path: '/pillars', match: (p: string) => p.startsWith('/pillars') || p.startsWith('/body') || p.startsWith('/money') || p.startsWith('/knowledge') },
  { label: 'Planner', icon: <CalendarIcon />, path: '/planner', match: (p: string) => p === '/planner' },
  { label: 'Timeline', icon: <TimelineIcon />, path: '/timeline', match: (p: string) => p === '/timeline' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeIndex = NAV_ITEMS.findIndex(n => n.match(location.pathname))
  const isSettings = location.pathname === '/settings'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{
        px: 3, pt: 'calc(14px + env(safe-area-inset-top))', pb: 1.75,
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'primary.main', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            EVIDENCE
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Personal Growth OS
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => navigate('/settings')}
          sx={{ color: isSettings ? 'primary.main' : 'text.secondary' }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', pb: 'calc(70px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </Box>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, borderTop: '1px solid', borderColor: 'divider', pb: 'env(safe-area-inset-bottom)' }}
        elevation={0}
      >
        <BottomNavigation
          value={activeIndex === -1 ? false : activeIndex}
          onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
          sx={{ bgcolor: 'background.paper', height: 64 }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' }, minWidth: 0 }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
