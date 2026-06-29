import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      evidence_entries: {
        Row: { id: string; user_id: string; pillar: string; category: string; xp: number; note: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['evidence_entries']['Row'], 'created_at'> & { created_at?: string }
      }
      food_entries: {
        Row: { id: string; user_id: string; date: string; meal: string; name: string; kcal: number; protein: number; note: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['food_entries']['Row'], 'created_at'> & { created_at?: string }
      }
      weight_entries: {
        Row: { id: string; user_id: string; date: string; weight: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['weight_entries']['Row'], 'created_at'> & { created_at?: string }
      }
      body_settings: {
        Row: { user_id: string; calorie_target: number; protein_target: number; strict_mode: boolean }
        Insert: Database['public']['Tables']['body_settings']['Row']
      }
    }
  }
}
