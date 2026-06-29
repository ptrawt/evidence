import { supabase } from '../supabase'

export type MoneyType = 'expense' | 'savings' | 'impulse_resisted'

export interface MoneyEntry {
  id: string
  date: string
  type: MoneyType
  amount: number
  category: string
  note: string
  createdAt: string
}

export async function fetchMoneyEntries(userId: string): Promise<MoneyEntry[]> {
  const { data, error } = await supabase
    .from('money_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(r => ({
    id: r.id, date: r.date, type: r.type as MoneyType,
    amount: Number(r.amount), category: r.category,
    note: r.note, createdAt: r.created_at,
  }))
}

export async function insertMoneyEntry(userId: string, entry: MoneyEntry): Promise<void> {
  const { error } = await supabase.from('money_entries').insert({
    id: entry.id, user_id: userId, date: entry.date,
    type: entry.type, amount: entry.amount,
    category: entry.category, note: entry.note,
    created_at: entry.createdAt,
  })
  if (error) throw error
}

export async function removeMoneyEntry(id: string): Promise<void> {
  const { error } = await supabase.from('money_entries').delete().eq('id', id)
  if (error) throw error
}
