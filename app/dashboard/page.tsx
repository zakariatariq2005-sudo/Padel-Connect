'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sendMatchRequest } from '@/app/actions/matchmaking';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import HeroSection from '@/components/HeroSection';
import PlayerCard from '@/components/PlayerCard';

/**
 * Dashboard Page - Players
 * 
 * Matches exact design from image with:
 * - Hero section
 * - Your Match Requests section (with green bar)
 * - Online Players section (with green bar and debug info)
 */
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
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
              skill_level: 'Beginner',
              location: 'Unknown',
              is_online: false, // Don't allow online until nickname is set
            })
            .select()
            .single();
          
          setProfile(newProfile || null);
          // Redirect to complete profile if no nickname
          if (!newProfile?.nickname) {
            router.push('/complete-profile');
            return;
          }
        } else {
          setProfile(profileData);
          // Redirect to complete profile if no nickname
          if (!profileData.nickname) {
            router.push('/complete-profile');
            return;
          }
        }

        // Load online players (only those with nicknames)
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('is_online', true)
          .neq('user_id', authUser.id)
          .not('nickname', 'is', null)
          .order('nickname', { ascending: true });

        setPlayers(playersData || []);

        // Load outgoing requests
        const { data: outgoingData } = await supabase
          .from('match_requests')
          .select('*')
          .eq('sender_id', authUser.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        // Fetch receiver profiles
        const receiverIds = (outgoingData || []).map((r: any) => r.receiver_id);
        const { data: receiversData } = await supabase
          .from('players')
          .select('*')
          .in('user_id', receiverIds);

        const receiversMap = new Map((receiversData || []).map((p: any) => [p.user_id, p]));

        setOutgoingRequests((outgoingData || []).map((r: any) => ({
          ...r,
          receiver: receiversMap.get(r.receiver_id),
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        router.push('/login');
      }
    };

    loadDashboard();
  }, [router, supabase]);

  const handleRequestMatch = async (playerId: string) => {
    setRequesting(playerId);
    const result = await sendMatchRequest(playerId);
    
    if (!result.success) {
      alert(result.error || 'Failed to send match request');
    } else {
      alert('Match request sent!');
      router.refresh();
    }
    
    setRequesting(null);
  };

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
      <Header isOnline={profile?.is_online || false} />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection isOnline={profile?.is_online || false} />

        {/* Your Match Requests Section */}
        {outgoingRequests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded-full"></span>
              Your Match Requests
            </h2>
            
            <div className="space-y-3">
              {outgoingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-dark-light rounded-lg shadow p-5 border border-dark-lighter text-center"
                >
                  <p className="font-medium text-neutral mb-2">
                    You requested to play with {request.receiver?.nickname || 'Unknown Player'}
                  </p>
                  <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Online Players Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Online Players
          </h2>
          
          {players && players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onRequestMatch={handleRequestMatch}
                  isRequesting={requesting === player.user_id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-dark-light rounded-lg shadow p-8 border border-dark-lighter text-center">
              <p className="text-gray-300 text-center mb-2">No other players online right now</p>
              <p className="text-sm text-gray-400 text-center mb-4">
                Make sure you're online (toggle in top right) and other players are also online to see them here.
              </p>
              <div className="mt-4 p-3 bg-dark-lighter rounded text-xs text-gray-400">
                <p>Debug info: Your user ID is {user.id?.substring(0, 8)}...</p>
                <p>Online players count: {players.length}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
