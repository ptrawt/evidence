import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webPush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Bangkok = UTC+7
  const bangkokHour = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCHours()

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('reminder_hour', bangkokHour)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const payload = JSON.stringify({
    title: 'Evidence 💪',
    body: 'เช็ค daily habits ของวันนี้ยัง?',
    url: '/',
  })

  const results = await Promise.allSettled(
    (subs ?? []).map(sub =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      )
    ),
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return new Response(JSON.stringify({ sent, failed, hour: bangkokHour }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
