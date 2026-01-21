'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

/**
 * Profile Page
 * 
 * Simple profile display with user info and logout.
 * Uses existing LogoutButton component - does not reimplement logout logic.
 */
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        const { data: profileData } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        setProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/login');
      }
    };

    loadProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark pb-20 md:pb-0">
      <Header isOnline={profile?.is_online || false} userName={profile?.name} />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="bg-neutral rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-dark mb-6">
            Your Profile
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Name</span>
              <span className="text-dark font-semibold">{profile?.name || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Skill Level</span>
              <span className="text-dark font-semibold">{profile?.skill_level || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">City</span>
              <span className="text-dark font-semibold">{profile?.location || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">Email</span>
              <span className="text-dark font-semibold">{user.email}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <LogoutButton />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

