import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missingConfig = !supabaseUrl || !supabaseAnonKey
const usingPlaceholders =
  supabaseUrl === 'your_project_url_here' ||
  supabaseAnonKey === 'your_anon_key_here'

export const supabaseConfigError =
  missingConfig || usingPlaceholders
    ? 'Add your Supabase project URL and anon key to .env.local, then restart the dev server.'
    : null

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
