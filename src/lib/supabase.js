import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jhhhndxpoqzkejhkpmpw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_92HIKlp9abD_wQlLhjTPfQ_Cz89uj9k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
