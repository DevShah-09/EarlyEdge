import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321' // Mock URL to prevent crash
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase env vars not set. Mocking client to prevent crash.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
