// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rmrpxltbqbqzepxjejba.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtcnB4bHRicWJxemVweGplamJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ3MDIsImV4cCI6MjA1ODc0MDcwMn0.LDUEKuBxRUTvJvXfRYb58A_m1yL9lCk_O5UOIwtLDJY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);