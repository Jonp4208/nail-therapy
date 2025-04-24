// Script to set a user as admin in the Supabase database
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const userEmail = process.argv[2]; // Get email from command line argument

if (!userEmail) {
  console.error('Please provide a user email as an argument');
  console.log('Usage: node set-admin.js user@example.com');
  process.exit(1);
}

async function setUserAsAdmin() {
  console.log(`Setting user ${userEmail} as admin...`);
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // First, find the user by email
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('email', userEmail);
      
    if (userError) {
      throw userError;
    }
    
    if (!users || users.length === 0) {
      console.error(`No user found with email: ${userEmail}`);
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`Found user with ID: ${userId}`);
    console.log(`Current admin status: ${users[0].is_admin}`);
    
    // Update the user's is_admin field to true
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
    
    console.log(`Successfully set user ${userEmail} as admin!`);
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`Verified admin status: ${verifyData.is_admin}`);
    
  } catch (error) {
    console.error('Error setting user as admin:', error.message);
    process.exit(1);
  }
}

setUserAsAdmin();
