import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Supabase URL:", supabaseUrl);
  // We can't log in without credentials, but we can check the table structure via REST if we use the service_role key.
  // Is there a VITE_SUPABASE_SERVICE_ROLE_KEY?
  const serviceKey = envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || supabaseKey;
  const adminClient = createClient(supabaseUrl, serviceKey);

  console.log('Querying all comments as admin...');
  const { data, error } = await adminClient.from('community_creation_comments').select('*');
  console.log('Comments in DB:', data?.length, error?.message || 'No errors');
  if (data && data.length > 0) {
    console.log('Sample comment:', data[0]);
  }
}

test().catch(console.error);
