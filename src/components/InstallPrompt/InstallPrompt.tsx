import { useState, useEffect } from 'react'
import { Snackbar, Button, Box, Typography } from '@mui/material'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setOpen(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
    setOpen(false)
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 80, sm: 80 }, maxWidth: 400, width: '92vw' }}
      ContentProps={{
        sx: {
          bgcolor: '#1a1a1a', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 3, px: 2.5, py: 1.5,
          flexDirection: 'column', alignItems: 'flex-start', gap: 1.5,
        },
      }}
      message={
        <Box>
          <Typography variant="body2" fontWeight={800} sx={{ color: '#fff' }}>
            📲 ติดตั้ง Evidence
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            เข้าถึงได้เหมือน native app ทั้งมือถือและ desktop
          </Typography>
        </Box>
      }
      action={
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            size="small"
            onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}
          >
            ไว้ทีหลัง
          </Button>
          <Button
            size="small" variant="contained"
            onClick={handleInstall}
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 800, borderRadius: 2, px: 2 }}
          >
            ติดตั้ง
          </Button>
        </Box>
      }
    />
  )
}
