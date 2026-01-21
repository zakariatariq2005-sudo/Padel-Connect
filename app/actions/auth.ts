'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Server Action for login
 * This ensures cookies are properly set on the server side
 */
export async function loginAction(email: string, password: string) {
  const supabase = await createClient();

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { success: false, error: signInError.message };
  }

  if (!authData.session || !authData.user) {
    return { success: false, error: 'Login failed. Please try again.' };
  }

  // Update player online status
  try {
    await supabase
      .from('players')
      .update({ is_online: true })
      .eq('user_id', authData.user.id);
  } catch (profileError) {
    // If profile doesn't exist, create it
    await supabase
      .from('players')
      .insert({
        user_id: authData.user.id,
        name: authData.user.email?.split('@')[0] || 'Player',
        skill_level: 'Beginner',
        location: 'Unknown',
        is_online: true,
      });
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

