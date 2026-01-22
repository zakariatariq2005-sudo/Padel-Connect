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
    // Check if profile exists and has nickname
    const { data: profile } = await supabase
      .from('players')
      .select('nickname')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profile && !profile.nickname) {
      // Profile exists but no nickname - redirect to complete profile
      revalidatePath('/complete-profile');
      redirect('/complete-profile');
    }
    
    await supabase
      .from('players')
      .update({ is_online: true })
      .eq('user_id', authData.user.id);
  } catch (profileError) {
    // If profile doesn't exist, create it (without nickname)
    await supabase
      .from('players')
      .insert({
        user_id: authData.user.id,
        skill_level: 'Beginner',
        location: 'Unknown',
        is_online: false, // Don't allow online until nickname is set
      });
    
    // Redirect to complete profile
    revalidatePath('/complete-profile');
    redirect('/complete-profile');
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}



