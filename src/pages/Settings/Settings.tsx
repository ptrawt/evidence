import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, TextField, Button, Divider, Switch,
  FormControlLabel, Snackbar, Alert, Select, MenuItem,
  FormControl, InputLabel, CircularProgress,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateSettings, toggleStrictMode, saveBodySettings } from '../../store/bodySettingsSlice'
import { selectBodySettings } from '../../store/bodySelectors'
import { useAuth } from '../../contexts/AuthContext'
import { isPushSupported, subscribeToPush, unsubscribeFromPush, getPushSubscription } from '../../lib/push'
import { savePushSubscription, deletePushSubscription, updateReminderHour, fetchReminderHour } from '../../lib/db/pushSubscriptions'
import { exportEvidence, exportFood, exportWeight, exportMoney, exportKnowledge } from '../../lib/exportCsv'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5:00–22:00

export default function Settings() {
  const dispatch = useAppDispatch()
  const { user, signOut } = useAuth()
  const settings = useAppSelector(selectBodySettings)
  const evidence = useAppSelector(s => s.evidence.entries)
  const food = useAppSelector(s => s.food.entries)
  const weight = useAppSelector(s => s.weight.entries)
  const money = useAppSelector(s => s.money.entries)
  const knowledge = useAppSelector(s => s.knowledge.entries)

  const [calorieTarget, setCalorieTarget] = useState(String(settings.calorieTarget))
  const [proteinTarget, setProteinTarget] = useState(String(settings.proteinTarget))
  const [weightGoal, setWeightGoal] = useState(settings.weightGoal ? String(settings.weightGoal) : '')
  const [saved, setSaved] = useState(false)

  // Push notifications
  const pushSupported = isPushSupported()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [reminderHour, setReminderHour] = useState(8)
  const [timeSaved, setTimeSaved] = useState(false)
  const [pushError, setPushError] = useState('')

  useEffect(() => {
    if (!pushSupported || !user) return
    getPushSubscription().then(sub => setPushEnabled(!!sub))
    fetchReminderHour(user.id).then(h => { if (h !== null) setReminderHour(h) })
  }, [pushSupported, user])

  const handleSave = async () => {
    const kcal = parseInt(calorieTarget)
    const protein = parseInt(proteinTarget)
    if (isNaN(kcal) || isNaN(protein) || kcal <= 0 || protein <= 0) return
    const wGoal = weightGoal ? parseFloat(weightGoal) : undefined

    const next = { ...settings, calorieTarget: kcal, proteinTarget: protein, weightGoal: wGoal }
    dispatch(updateSettings(next))
    if (user) dispatch(saveBodySettings({ userId: user.id, settings: next }))
    setSaved(true)
  }

  const handleToggleStrict = () => {
    dispatch(toggleStrictMode())
    const next = { ...settings, strictMode: !settings.strictMode }
    if (user) dispatch(saveBodySettings({ userId: user.id, settings: next }))
  }

  const handlePushToggle = async () => {
    if (!user) return
    setPushLoading(true)
    try {
      if (pushEnabled) {
        await unsubscribeFromPush()
        await deletePushSubscription(user.id)
        setPushEnabled(false)
      } else {
        const sub = await subscribeToPush()
        if (sub) {
          await savePushSubscription(user.id, sub, reminderHour)
          setPushEnabled(true)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Push notification failed'
      setPushError(msg)
    }
    setPushLoading(false)
  }

  const handleSaveReminderTime = async () => {
    if (!user) return
    await updateReminderHour(user.id, reminderHour)
    setTimeSaved(true)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Settings</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>ตั้งค่าเป้าหมายส่วนตัว</Typography>

      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>💪 Body Targets</Typography>
      <Card sx={{ p: 2.5, mt: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Calorie Target (kcal/day)" value={calorieTarget}
            onChange={e => setCalorieTarget(e.target.value)}
            type="number" size="small" fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <TextField
            label="Protein Target (g/day)" value={proteinTarget}
            onChange={e => setProteinTarget(e.target.value)}
            type="number" size="small" fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>
        <TextField
          label="Weight Goal (kg)" value={weightGoal}
          onChange={e => setWeightGoal(e.target.value)}
          type="number" size="small" fullWidth sx={{ mb: 2 }}
          placeholder="e.g. 80"
          slotProps={{ htmlInput: { min: 1, step: '0.5' } }}
        />
        <Button fullWidth variant="contained" onClick={handleSave}
          sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700 }}>
          Save Targets
        </Button>
      </Card>

      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>⚡ Strict Mode</Typography>
      <Card sx={{ p: 2.5, mt: 1, mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={settings.strictMode} onChange={handleToggleStrict} color="warning" />}
          label={
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Strict Mode {settings.strictMode ? 'ON' : 'OFF'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                แจ้งเตือนเมื่อยังไม่ชั่งน้ำหนัก, ยังไม่ log อาหาร, kcal เกินเป้า, streak หลุด
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', mx: 0 }}
        />
      </Card>

      {pushSupported && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>🔔 Daily Reminders</Typography>
          <Card sx={{ p: 2.5, mt: 1, mb: 3 }}>
            <FormControlLabel
              control={
                pushLoading
                  ? <CircularProgress size={20} sx={{ mx: 1.5, color: 'primary.main' }} />
                  : <Switch checked={pushEnabled} onChange={handlePushToggle} color="primary" />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Push Notifications {pushEnabled ? 'ON' : 'OFF'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    แจ้งเตือนประจำวันให้เช็ค habits
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mx: 0, mb: pushEnabled ? 2 : 0 }}
            />
            {pushEnabled && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>เตือนตอน</InputLabel>
                  <Select
                    value={reminderHour}
                    label="เตือนตอน"
                    onChange={e => setReminderHour(Number(e.target.value))}
                  >
                    {HOURS.map(h => (
                      <MenuItem key={h} value={h}>
                        {String(h).padStart(2, '0')}:00 น.
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={handleSaveReminderTime}
                  sx={{ borderColor: 'primary.main', color: 'primary.main', fontWeight: 700 }}>
                  Save
                </Button>
              </Box>
            )}
          </Card>
        </>
      )}

      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>📦 Export Data</Typography>
      <Card sx={{ p: 2.5, mt: 1, mb: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          ดาวน์โหลดข้อมูลเป็น CSV — เปิดด้วย Excel หรือ Google Sheets ได้เลย
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { label: '⚡ Evidence', action: () => exportEvidence(evidence) },
            { label: '🍽️ Food', action: () => exportFood(food) },
            { label: '⚖️ Weight', action: () => exportWeight(weight) },
            { label: '💰 Money', action: () => exportMoney(money) },
            { label: '🧠 Knowledge', action: () => exportKnowledge(knowledge) },
          ].map(({ label, action }) => (
            <Button key={label} variant="outlined" size="small" onClick={action}
              sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'text.primary', fontWeight: 600 }}>
              {label}
            </Button>
          ))}
        </Box>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Account</Typography>
      <Card sx={{ p: 2.5, mt: 1, mb: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>{user?.email}</Typography>
        <Button fullWidth variant="outlined" color="error" onClick={signOut}>
          Sign Out
        </Button>
      </Card>

      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>About</Typography>
      <Card sx={{ p: 2.5, mt: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Evidence</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          Personal Growth OS · Phase 2
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          "Build the strongest version of yourself through evidence, not motivation."
        </Typography>
      </Card>

      <Snackbar open={saved} autoHideDuration={2000} onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>Settings saved</Alert>
      </Snackbar>

      <Snackbar open={timeSaved} autoHideDuration={2000} onClose={() => setTimeSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>Reminder time saved</Alert>
      </Snackbar>

      <Snackbar open={!!pushError} autoHideDuration={4000} onClose={() => setPushError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="warning" variant="filled" sx={{ fontWeight: 700 }}>{pushError}</Alert>
      </Snackbar>
    </Box>
  )
}
