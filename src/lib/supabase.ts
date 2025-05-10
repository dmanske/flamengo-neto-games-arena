
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Hardcoded values for development (would use environment variables in production)
const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
