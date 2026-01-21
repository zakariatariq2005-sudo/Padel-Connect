'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Server Action for login
 * This ensures cookies are set on the server where they can be immediately read
 */
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Please enter email and password' };
  }

  const supabase = await createClient();

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { 
      success: false, 
      error: signInError.message.includes('email') || signInError.message.includes('confirm') || signInError.message.includes('Invalid')
        ? 'Invalid credentials. If you just signed up, please check your email to confirm your account first.'
        : signInError.message
    };
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

