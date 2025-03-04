
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joljkcnlrkerzcoowqgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGprY25scmtlcnpjb293cWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTA1NjEsImV4cCI6MjA1NjY2NjU2MX0.OXhcejWbPVvIg12VWe9woy36E10i2hYbUZvWZXaI8X4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
