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
    // Check if profile exists and has name
    const { data: profile } = await supabase
      .from('players')
      .select('name')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profile && !profile.name) {
      // Profile exists but no name - allow access, can set from profile page
    }
    
    await supabase
      .from('players')
      .update({ is_online: true })
      .eq('user_id', authData.user.id);
  } catch (profileError) {
    // If profile doesn't exist, create it (without name)
    await supabase
      .from('players')
      .insert({
        user_id: authData.user.id,
        skill_level: 'Beginner',
        location: 'Unknown',
        is_online: true, // Allow online - name can be set later
      });
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}



