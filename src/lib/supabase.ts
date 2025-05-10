
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use the same values as in the integrations file
const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
