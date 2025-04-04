
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://avlxadmsemdtiygbotas.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bHhhZG1zZW1kdGl5Z2JvdGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTcxNzQsImV4cCI6MjA1OTM3MzE3NH0.Uy397lqE2j6yU9dtNvkM5hNR28al_lBYv8gZQKhGRks';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
