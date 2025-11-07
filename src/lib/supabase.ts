import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Store = {
  id: string
  code: string
  name: string
  area: string
  status: string
  postcode: string
  created_at: string
}

export type Message = {
  id: string
  title: string
  body: string
  list_of_stores: string[]
  user_id: string
  date_created: string
}

export type Profile = {
  id: string
  full_name: string
  email: string
  created_at: string
}
