import { createClient } from "@supabase/supabase-js"

// These should be set as environment variables in production
// For now, you'll need to replace these with your Supabase project credentials
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Please set PLASMO_PUBLIC_SUPABASE_URL and PLASMO_PUBLIC_SUPABASE_ANON_KEY in your .env file"
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

