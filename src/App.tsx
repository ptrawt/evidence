import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material'
import { store } from './store'
import theme from './theme'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useDataSync } from './hooks/useDataSync'
import AppLayout from './components/Layout/AppLayout'
import Today from './pages/Today/Today'
import Pillars from './pages/Pillars/Pillars'
import PillarDetail from './pages/Pillars/PillarDetail'
import Timeline from './pages/Timeline/Timeline'
import BodyHub from './pages/Body/BodyHub'
import FoodLog from './pages/Body/FoodLog'
import WeightLog from './pages/Body/WeightLog'
import BodyCharts from './pages/Body/BodyCharts'
import WorkoutLog from './pages/Body/WorkoutLog'
import WorkoutSplit from './pages/Body/WorkoutSplit'
import ExerciseLibrary from './pages/Body/ExerciseLibrary'
import Settings from './pages/Settings/Settings'
import Login from './pages/Auth/Login'
import QuestManagement from './pages/Quests/QuestManagement'
import MoneyHub from './pages/Money/MoneyHub'
import KnowledgeHub from './pages/Knowledge/KnowledgeHub'
import ProgressPhotos from './pages/Body/ProgressPhotos'
import PlannerHub from './pages/Planner/PlannerHub'
import InstallPrompt from './components/InstallPrompt/InstallPrompt'

function AppRoutes() {
  const { user, loading } = useAuth()
  useDataSync(user?.id ?? null)

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Today />} />
        <Route path="/pillars" element={<Pillars />} />
        <Route path="/pillars/:id" element={<PillarDetail />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/body" element={<BodyHub />} />
        <Route path="/body/food" element={<FoodLog />} />
        <Route path="/body/weight" element={<WeightLog />} />
        <Route path="/body/workout" element={<WorkoutLog />} />
        <Route path="/body/workout/split" element={<WorkoutSplit />} />
        <Route path="/body/exercises" element={<ExerciseLibrary />} />
        <Route path="/body/charts" element={<BodyCharts />} />
        <Route path="/body/photos" element={<ProgressPhotos />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/quests" element={<QuestManagement />} />
        <Route path="/money" element={<MoneyHub />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
        <Route path="/planner" element={<PlannerHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <InstallPrompt />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
