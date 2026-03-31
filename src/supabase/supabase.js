import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nmfyyhuvnwmxvgirffpz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZnl5aHV2bndteHZnaXJmZnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDY5OTQsImV4cCI6MjA5MDUyMjk5NH0.8qneZZecL6s_0utZZmF9xUwXkozRQel0a2CwQE6daIU";

export const supabase = createClient(supabaseUrl, supabaseKey);