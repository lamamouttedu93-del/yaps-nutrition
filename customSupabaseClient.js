import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppiqnzejvaxoyhvnzltl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwaXFuemVqdmF4b3lodm56bHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjc5ODgsImV4cCI6MjA3Mzk0Mzk4OH0.G6GUOD8Maoj2Ep4U6iRa1wlhfnqASZC7zBRFFMB7MFQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);