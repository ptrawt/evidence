import { supabase } from '../supabase'

export async function savePushSubscription(
  userId: string,
  sub: PushSubscription,
  reminderHour: number,
): Promise<void> {
  const json = sub.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    reminder_hour: reminderHour,
  }, { onConflict: 'endpoint' })
  if (error) throw error
}

export async function deletePushSubscription(userId: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', userId)
  if (error) throw error
}

export async function updateReminderHour(userId: string, reminderHour: number): Promise<void> {
  const { error } = await supabase.from('push_subscriptions')
    .update({ reminder_hour: reminderHour })
    .eq('user_id', userId)
  if (error) throw error
}

export async function fetchReminderHour(userId: string): Promise<number | null> {
  const { data } = await supabase
    .from('push_subscriptions')
    .select('reminder_hour')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  return data?.reminder_hour ?? null
}
