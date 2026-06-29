import type { EvidenceEntry } from '../types'
import type { FoodEntry, WeightEntry } from '../types/body'
import type { MoneyEntry } from './db/money'
import type { KnowledgeEntry } from './db/knowledge'

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const today = () => new Date().toISOString().slice(0, 10)

export function exportEvidence(entries: EvidenceEntry[]): void {
  downloadCsv(
    `evidence-log-${today()}.csv`,
    ['date', 'pillar', 'category', 'xp', 'note'],
    entries.map(e => [e.createdAt.slice(0, 10), e.pillar, e.category, e.xp, e.note]),
  )
}

export function exportFood(entries: FoodEntry[]): void {
  downloadCsv(
    `food-log-${today()}.csv`,
    ['date', 'meal', 'name', 'kcal', 'protein_g', 'note'],
    entries.map(e => [e.date, e.meal, e.name, e.kcal, e.protein, e.note ?? '']),
  )
}

export function exportWeight(entries: WeightEntry[]): void {
  downloadCsv(
    `weight-log-${today()}.csv`,
    ['date', 'weight_kg'],
    entries.map(e => [e.date, e.weight]),
  )
}

export function exportMoney(entries: MoneyEntry[]): void {
  downloadCsv(
    `money-log-${today()}.csv`,
    ['date', 'type', 'category', 'amount', 'note'],
    entries.map(e => [e.date, e.type, e.category, e.amount, e.note ?? '']),
  )
}

export function exportKnowledge(entries: KnowledgeEntry[]): void {
  downloadCsv(
    `knowledge-log-${today()}.csv`,
    ['date', 'pillar', 'topic', 'type', 'minutes', 'notes'],
    entries.map(e => [e.date, e.pillar, e.topic, e.type, e.minutes, e.notes ?? '']),
  )
}
