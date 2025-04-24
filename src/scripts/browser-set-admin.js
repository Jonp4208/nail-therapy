// Copy and paste this code into your browser console when logged in
// This will make your current user an admin

async function makeCurrentUserAdmin() {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user is logged in');
      return;
    }
    
    console.log('Current user ID:', user.id);
    
    // Check current admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    console.log('Current admin status:', profile?.is_admin);
    
    // Update the user to be an admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error updating profile:', error);
      return;
    }
    
    console.log('Successfully set as admin!');
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('Verified admin status:', verifyData.is_admin);
    console.log('Please refresh the page to see the changes');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
makeCurrentUserAdmin();
