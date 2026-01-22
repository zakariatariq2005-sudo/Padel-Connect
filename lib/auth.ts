import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

/**
 * Gets the current authenticated user from the server.
 * If no user is logged in, returns null.
 * This is useful for checking authentication status in Server Components.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Requires authentication - if user is not logged in, redirects to login page.
 * Use this in Server Components or Server Actions that require authentication.
 * Returns the authenticated user if successful.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
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
    // If profile doesn't exist, create one (but without nickname - user must set it)
    const { data: newProfile } = await supabase
      .from('players')
      .insert({
        user_id: user.id,
        skill_level: 'Beginner',
        location: 'Unknown',
        is_online: false, // Don't allow online until nickname is set
      })
      .select()
      .single();

    return newProfile;
  }

  // If nickname is missing, user can set it from profile page
  // No longer blocking access - just return the profile
  return profile;
}


