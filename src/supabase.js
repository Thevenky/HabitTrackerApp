
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wpfhuuvhxtijmyxtltoj.supabase.co'
const supabaseKey = 'sb_publishable_aUROUbtPBMv3tWyilMckOw_sX1hS7EO' // Using the provided key

export const supabase = createClient(supabaseUrl, supabaseKey)
