'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Logout Button Component
 * 
 * This component handles user logout. When clicked, it:
 * 1. Updates the player's online status to false
 * 2. Signs out the user from Supabase
 * 3. Redirects to the login page
 */
export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    // Get current user to update their online status
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Set player as offline
      await supabase
        .from('players')
        .update({ is_online: false })
        .eq('user_id', user.id);
    }

    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Redirect to login page
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-gray-200 text-dark font-medium py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
    >
      Logout
    </button>
  );
}


