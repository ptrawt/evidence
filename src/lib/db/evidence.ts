import { supabase } from '../supabase'
import type { EvidenceEntry } from '../../types'

export async function fetchEvidence(userId: string): Promise<EvidenceEntry[]> {
  const { data, error } = await supabase
    .from('evidence_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id, pillar: r.pillar as EvidenceEntry['pillar'],
    category: r.category, xp: r.xp, note: r.note, createdAt: r.created_at,
  }))
}

export async function insertEvidence(userId: string, entry: EvidenceEntry) {
  const { error } = await supabase.from('evidence_entries').insert({
    id: entry.id, user_id: userId, pillar: entry.pillar,
    category: entry.category, xp: entry.xp, note: entry.note,
    created_at: entry.createdAt,
  })
  if (error) throw error
}

export async function removeEvidence(id: string) {
  const { error } = await supabase.from('evidence_entries').delete().eq('id', id)
  if (error) throw error
}
