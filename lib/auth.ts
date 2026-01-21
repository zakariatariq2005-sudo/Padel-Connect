import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

/**
 * Gets the current authenticated user from the server.
 * If no user is logged in, returns null.
 * This is useful for checking authentication status in Server Components.
 */
export async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If there's an error or no user, return null
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    // If there's any error getting the user, return null
    return null;
  }
}

/**
 * Requires authentication - if user is not logged in, redirects to login page.
 * Use this in Server Components or Server Actions that require authentication.
 * Returns the authenticated user if successful.
 */
export async function requireAuth() {
  try {
    const supabase = await createClient();
    
    // Try to get user with session refresh
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login');
    }
    
    return user;
  } catch (error) {
    // If there's any error, redirect to login
    redirect('/login');
  }
}

/**
 * Gets the full user profile including player information from the database.
 * This combines auth user data with our custom player profile data.
 */
export async function getUserProfile() {
  const user = await requireAuth();
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    // If profile doesn't exist, create one
    const { data: newProfile } = await supabase
      .from('players')
      .insert({
        user_id: user.id,
        name: user.email?.split('@')[0] || 'Player',
        skill_level: 'Beginner',
        location: 'Unknown',
        is_online: true,
      })
      .select()
      .single();

    return newProfile;
  }

  return profile;
}


