import { supabase } from '../supabase'

export type KnowledgeType = 'book' | 'article' | 'course' | 'video' | 'practice' | 'leetcode' | 'other'

export interface KnowledgeEntry {
  id: string
  date: string
  pillar: 'career' | 'mind'
  topic: string
  type: KnowledgeType
  minutes: number
  notes: string
  createdAt: string
}

export async function fetchKnowledgeEntries(userId: string): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(r => ({
    id: r.id, date: r.date,
    pillar: r.pillar as 'career' | 'mind',
    topic: r.topic, type: r.type as KnowledgeType,
    minutes: r.minutes, notes: r.notes,
    createdAt: r.created_at,
  }))
}

export async function insertKnowledgeEntry(userId: string, entry: KnowledgeEntry): Promise<void> {
  const { error } = await supabase.from('knowledge_entries').insert({
    id: entry.id, user_id: userId, date: entry.date,
    pillar: entry.pillar, topic: entry.topic,
    type: entry.type, minutes: entry.minutes,
    notes: entry.notes, created_at: entry.createdAt,
  })
  if (error) throw error
}

export async function removeKnowledgeEntry(id: string): Promise<void> {
  const { error } = await supabase.from('knowledge_entries').delete().eq('id', id)
  if (error) throw error
}
