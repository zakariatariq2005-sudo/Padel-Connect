'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Logout Button Component
 * 
 * Premium logout button with icon.
 * Updates player online status and signs out user.
 */
export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('players')
        .update({ is_online: false })
        .eq('user_id', user.id);
    }

    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2.5 bg-dark-lighter hover:bg-dark-lighter/80 border border-white/10 
                 rounded-xl text-gray-300 hover:text-white transition-all duration-200
                 active:scale-95"
      title="Logout"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}
