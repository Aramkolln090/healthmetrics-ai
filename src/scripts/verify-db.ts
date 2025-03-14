import { testSupabaseConnection } from '../lib/db/test-connection';

async function main() {
  console.log('Starting Supabase connection test...');
  
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    console.error('❌ TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required');
    process.exit(1);
  }

  try {
    const success = await testSupabaseConnection(testEmail, testPassword);
    if (success) {
      console.log('✅ All database tests passed!');
      process.exit(0);
    } else {
      console.error('❌ Database tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

main(); 