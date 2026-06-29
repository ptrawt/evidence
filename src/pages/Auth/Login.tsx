import { useState } from 'react'
import { Box, Card, Typography, TextField, Button, Alert, Tabs, Tab, Divider } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    const fn = tab === 0 ? signIn : signUp
    const { error } = await fn(email, password)

    setLoading(false)
    if (error) {
      setError(error)
    } else if (tab === 1) {
      setSuccess(true)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
    }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px', mb: 0.5 }}
          >
            EVIDENCE
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Personal Growth OS
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {success ? (
          <Alert severity="success">
            สร้างบัญชีสำเร็จ! ตรวจสอบ email เพื่อยืนยัน แล้วกลับมา login
          </Alert>
        ) : (
          <>
            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setError(null) }}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>{error}</Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              size="small"
              sx={{ mb: 3 }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email || !password}
              onClick={handleSubmit}
              sx={{
                bgcolor: 'primary.main', color: '#000', fontWeight: 800,
                py: 1.5, fontSize: '1rem',
              }}
            >
              {loading ? 'Loading...' : tab === 0 ? 'Login' : 'Create Account'}
            </Button>

            <Typography
              variant="caption"
              sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 2 }}
            >
              Personal use only — your data is yours
            </Typography>
          </>
        )}
      </Card>
    </Box>
  )
}
