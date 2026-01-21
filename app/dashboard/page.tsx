'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import OnlineToggle from '@/components/OnlineToggle';
import PlayerList from '@/components/PlayerList';
import Link from 'next/link';

/**
 * Dashboard Page (Client Component)
 * 
 * Checks auth client-side first to avoid cookie sync issues,
 * then loads data once authenticated.
 */
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check auth client-side
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (profileError || !profileData) {
          // Create profile if doesn't exist
          const { data: newProfile } = await supabase
            .from('players')
            .insert({
              user_id: authUser.id,
              name: authUser.email?.split('@')[0] || 'Player',
              skill_level: 'Beginner',
              location: 'Unknown',
              is_online: true,
            })
            .select()
            .single();
          
          setProfile(newProfile || null);
        } else {
          setProfile(profileData);
        }

        // Load online players
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('is_online', true)
          .neq('user_id', authUser.id)
          .order('name', { ascending: true });

        setPlayers(playersData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        router.push('/login');
      }
    };

    loadDashboard();
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
    return null; // Router will handle redirect
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-neutral border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">PadelConnect</h1>
              <p className="text-sm text-gray-600">Welcome, {profile?.name || 'Player'}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/requests"
                className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
              >
                Requests Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Online</span>
                <OnlineToggle initialStatus={profile?.is_online || false} />
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-heading font-bold text-neutral mb-2">
            Online Players
          </h2>
          <p className="text-gray-400">
            Find players to match with and start playing padel!
          </p>
        </div>

        {/* Player List */}
        {players && players.length > 0 ? (
          <PlayerList players={players} currentUserId={user.id} />
        ) : (
          <div className="bg-neutral rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No other players online at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon to find matches!</p>
          </div>
        )}

        {/* Quick Link to Requests */}
        <div className="mt-8 text-center">
          <Link
            href="/requests"
            className="inline-block bg-primary text-neutral font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          >
            View All Match Requests →
          </Link>
        </div>
      </main>
    </div>
  );
}
