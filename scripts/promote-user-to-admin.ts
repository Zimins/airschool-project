/**
 * Utility script to promote a user to admin role
 * Usage: npx ts-node scripts/promote-user-to-admin.ts <email>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function promoteUserToAdmin(email: string) {
  try {
    console.log(`\n🔄 Promoting user ${email} to admin role...`);

    // Call the SQL function we created
    const { data, error } = await supabase.rpc('update_user_role_by_email', {
      user_email: email,
      new_role: 'admin'
    });

    if (error) {
      console.error('❌ Error promoting user:', error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully promoted ${email} to admin role!`);
    console.log('\n📝 Note: The user needs to log out and log back in for the role change to take effect.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx ts-node scripts/promote-user-to-admin.ts <email>');
  console.log('Example: npx ts-node scripts/promote-user-to-admin.ts test@airschool.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

promoteUserToAdmin(email);