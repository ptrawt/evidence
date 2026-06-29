import { useState } from 'react'
import {
  Box, Typography, Card, Button, Chip, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import { DeleteOutlined as DeleteIcon } from '@mui/icons-material'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addMoneyAsync, deleteMoneyAsync } from '../../store/moneySlice'
import {
  selectTodayMoney, selectTodayExpenseTotal,
  selectMonthExpenseTotal, selectMonthSavingsTotal,
  selectMonthImpulseCount, selectMonthImpulseSaved,
  selectRecentMoney,
} from '../../store/moneySelectors'
import { addEvidenceAsync } from '../../store/evidenceSlice'
import { useAuth } from '../../contexts/AuthContext'
import type { MoneyType } from '../../lib/db/money'

const EXPENSE_CATEGORIES = [
  '🍜 อาหาร', '🚌 เดินทาง', '🛍️ ช้อปปิ้ง', '🎮 บันเทิง',
  '💊 สุขภาพ', '🏠 ที่อยู่', '📱 Subscription', '📦 อื่นๆ',
]

const TYPE_CONFIG = {
  expense: { label: 'Expense', color: '#ef4444', emoji: '💸' },
  savings: { label: 'Savings', color: '#22c55e', emoji: '🏦' },
  impulse_resisted: { label: 'Impulse Resisted', color: '#f59e0b', emoji: '🛡️' },
}

const XP = { expense: 2, savings: 15, impulse_resisted: 20 }

interface FormState {
  type: MoneyType
  amount: string
  category: string
  note: string
}

const defaultForm = (): FormState => ({
  type: 'expense', amount: '', category: '🍜 อาหาร', note: '',
})

export default function MoneyHub() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const todayEntries = useAppSelector(selectTodayMoney)
  const todayExpenseTotal = useAppSelector(selectTodayExpenseTotal)
  const monthExpense = useAppSelector(selectMonthExpenseTotal)
  const monthSavings = useAppSelector(selectMonthSavingsTotal)
  const monthImpulseCount = useAppSelector(selectMonthImpulseCount)
  const monthImpulseSaved = useAppSelector(selectMonthImpulseSaved)
  const recentEntries = useAppSelector(selectRecentMoney)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm())
  const [openType, setOpenType] = useState<MoneyType>('expense')

  const openDialog = (type: MoneyType) => {
    setOpenType(type)
    setForm({ ...defaultForm(), type })
    setOpen(true)
  }

  const handleAdd = () => {
    if (!form.amount || !user) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return

    const today = new Date().toISOString().slice(0, 10)
    const entry = {
      id: nanoid(), date: today, type: form.type,
      amount, category: form.category, note: form.note,
      createdAt: new Date().toISOString(),
    }
    dispatch(addMoneyAsync({ userId: user.id, entry }))
    dispatch(addEvidenceAsync({
      userId: user.id,
      entry: {
        id: nanoid(), pillar: 'money', category: TYPE_CONFIG[form.type].label,
        xp: XP[form.type],
        note: form.type === 'impulse_resisted'
          ? `Resisted ฿${amount}${form.note ? ' — ' + form.note : ''}`
          : `฿${amount}${form.category ? ' ' + form.category : ''}${form.note ? ' — ' + form.note : ''}`,
        createdAt: new Date().toISOString(),
      },
    }))
    setOpen(false)
    setForm(defaultForm())
  }

  const monthStr = new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>💰 Money</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track spending · Save · Resist impulse</Typography>
      </Box>

      {/* Month Summary */}
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
        {monthStr}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1, mb: 3 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>ใช้ไปเดือนนี้</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#ef4444' }}>
            ฿{monthExpense.toLocaleString()}
          </Typography>
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>เก็บออมเดือนนี้</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#22c55e' }}>
            ฿{monthSavings.toLocaleString()}
          </Typography>
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Impulse resisted</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#f59e0b' }}>
            {monthImpulseCount} ครั้ง
          </Typography>
          {monthImpulseSaved > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ประหยัดได้ ฿{monthImpulseSaved.toLocaleString()}
            </Typography>
          )}
        </Card>
        <Card sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>วันนี้ใช้ไป</Typography>
          <Typography variant="h6" fontWeight={800}>
            ฿{todayExpenseTotal.toLocaleString()}
          </Typography>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Button
          variant="outlined" fullWidth
          onClick={() => openDialog('expense')}
          sx={{ borderColor: '#ef444444', color: '#ef4444', fontWeight: 700, py: 1.25 }}
        >
          💸 Log Expense
        </Button>
        <Button
          variant="outlined" fullWidth
          onClick={() => openDialog('savings')}
          sx={{ borderColor: '#22c55e44', color: '#22c55e', fontWeight: 700, py: 1.25 }}
        >
          🏦 Save
        </Button>
      </Box>
      <Button
        variant="contained" fullWidth
        onClick={() => openDialog('impulse_resisted')}
        sx={{
          mb: 3, py: 1.5, fontWeight: 800, fontSize: '1rem',
          bgcolor: '#f59e0b', color: '#000',
          '&:hover': { bgcolor: '#d97706' },
        }}
      >
        🛡️ Impulse Resisted! +{XP.impulse_resisted} XP
      </Button>

      {/* Today */}
      {todayEntries.length > 0 && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>วันนี้</Typography>
          <Card sx={{ mt: 1, mb: 3 }}>
            {todayEntries.map((e, i) => {
              const cfg = TYPE_CONFIG[e.type]
              return (
                <Box key={e.id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, gap: 1 }}>
                    <Typography fontSize={18}>{cfg.emoji}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {e.category || cfg.label}
                      </Typography>
                      {e.note && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{e.note}</Typography>
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: cfg.color, flexShrink: 0 }}>
                      {e.type === 'expense' ? '-' : '+'}฿{e.amount.toLocaleString()}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => dispatch(deleteMoneyAsync(e.id))}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Card>
        </>
      )}

      {/* Recent */}
      {recentEntries.filter(e => e.date !== new Date().toISOString().slice(0, 10)).length > 0 && (
        <>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>ล่าสุด</Typography>
          <Card sx={{ mt: 1 }}>
            {recentEntries
              .filter(e => e.date !== new Date().toISOString().slice(0, 10))
              .slice(0, 20)
              .map((e, i, arr) => {
                const cfg = TYPE_CONFIG[e.type]
                const showDate = i === 0 || arr[i - 1].date !== e.date
                return (
                  <Box key={e.id}>
                    {showDate && (
                      <Box sx={{ px: 2, pt: i === 0 ? 1.5 : 1, pb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {new Date(e.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </Typography>
                      </Box>
                    )}
                    {!showDate && i > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1 }}>
                      <Typography fontSize={16}>{cfg.emoji}</Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>{e.category || cfg.label}</Typography>
                        {e.note && <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{e.note}</Typography>}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: cfg.color, flexShrink: 0 }}>
                        {e.type === 'expense' ? '-' : '+'}฿{e.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
          </Card>
        </>
      )}

      {/* Log Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {TYPE_CONFIG[openType].emoji} {TYPE_CONFIG[openType].label}
        </DialogTitle>
        <DialogContent>
          {/* Amount */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>จำนวนเงิน (฿)</Typography>
          <TextField
            fullWidth autoFocus type="number"
            placeholder="0"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            size="small"
            sx={{ mt: 0.75, mb: 2.5 }}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />

          {/* Category (expense only) */}
          {form.type === 'expense' && (
            <>
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>หมวดหมู่</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mt: 0.75, mb: 2.5 }}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <ToggleButton
                    key={cat}
                    value={cat}
                    selected={form.category === cat}
                    onChange={() => setForm(f => ({ ...f, category: cat }))}
                    sx={{
                      border: '1px solid rgba(255,255,255,0.08) !important',
                      borderRadius: '8px !important',
                      py: 0.75, fontSize: '0.8rem', justifyContent: 'flex-start', px: 1.5,
                      '&.Mui-selected': {
                        bgcolor: '#ef444418 !important',
                        borderColor: '#ef4444 !important',
                        color: '#ef4444',
                      },
                    }}
                  >
                    {cat}
                  </ToggleButton>
                ))}
              </Box>
            </>
          )}

          {/* Note */}
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Note (optional)</Typography>
          <TextField
            fullWidth
            placeholder={form.type === 'impulse_resisted' ? 'อยากซื้ออะไร?' : 'รายละเอียด...'}
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            size="small"
            sx={{ mt: 0.75 }}
          />

          <Chip
            label={`+${XP[form.type]} XP`}
            size="small"
            sx={{ mt: 2, bgcolor: `${TYPE_CONFIG[form.type].color}18`, color: TYPE_CONFIG[form.type].color, fontWeight: 700 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!form.amount || parseFloat(form.amount) <= 0}
            onClick={handleAdd}
            sx={{ bgcolor: TYPE_CONFIG[openType].color, color: openType === 'savings' || openType === 'impulse_resisted' ? '#000' : '#fff', fontWeight: 700, flex: 1 }}
          >
            Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
