'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import OnlineToggle from '@/components/OnlineToggle';
import HeroAction from '@/components/HeroAction';
import PlaySessionModal from '@/components/PlaySessionModal';
import ActivePlaySession from '@/components/ActivePlaySession';
import MatchFoundCard from '@/components/MatchFoundCard';
import MatchRequestsSection from '@/components/MatchRequestsSection';
import CommunityPulse from '@/components/CommunityPulse';
import MobileNav from '@/components/MobileNav';
import PlayerList from '@/components/PlayerList';

/**
 * Dashboard Page - Intent-Driven Matchmaking
 * 
 * Core principle: "Players declare intent to play instead of browsing empty lists"
 * 
 * Structure:
 * 1. Hero Action (or Active Play Session if active)
 * 2. Match Found Card (if match found)
 * 3. Match Requests (only if they exist)
 * 4. Community Pulse (social proof)
 * 5. Profile section
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Play session state
  const [playSession, setPlaySession] = useState<{
    skillLevel: string;
    city: string;
    timeWindow: string;
  } | null>(null);
  const [showPlayModal, setShowPlayModal] = useState(false);
  
  // Match found state
  const [foundMatch, setFoundMatch] = useState<any>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  
  // Match requests (only show if they exist)
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  
  // Community metrics
  const [playersLookingToday, setPlayersLookingToday] = useState(0);
  const [matchesThisWeek, setMatchesThisWeek] = useState(0);
  
  // Online players list
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  
  const router = useRouter();
  const supabase = createClient();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      setProfile(profileData);

      // Load play session from localStorage (or could use a table)
      const savedSession = localStorage.getItem('playSession');
      if (savedSession) {
        try {
          setPlaySession(JSON.parse(savedSession));
        } catch (e) {
          localStorage.removeItem('playSession');
        }
      }

      // Get match requests (only if they exist)
      const { data: incomingData } = await supabase
        .from('match_requests')
        .select('*')
        .eq('receiver_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const senderIds = (incomingData || []).map((req: any) => req.sender_id);
      let senderProfiles: any[] = [];
      
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('players')
          .select('*')
          .in('user_id', senderIds);
        senderProfiles = profiles || [];
      }

      const incomingWithProfiles = (incomingData || []).map((req: any) => ({
        ...req,
        sender: senderProfiles.find((p: any) => p.user_id === req.sender_id) || null,
      }));
      setIncomingRequests(incomingWithProfiles);

      const { data: outgoingData } = await supabase
        .from('match_requests')
        .select('*')
        .eq('sender_id', session.user.id)
        .in('status', ['pending', 'accepted', 'rejected'])
        .order('created_at', { ascending: false });

      const receiverIds = (outgoingData || []).map((req: any) => req.receiver_id);
      let receiverProfiles: any[] = [];
      
      if (receiverIds.length > 0) {
        const { data: profiles } = await supabase
          .from('players')
          .select('*')
          .in('user_id', receiverIds);
        receiverProfiles = profiles || [];
      }

      const outgoingWithProfiles = (outgoingData || []).map((req: any) => ({
        ...req,
        receiver: receiverProfiles.find((p: any) => p.user_id === req.receiver_id) || null,
      }));
      setOutgoingRequests(outgoingWithProfiles);

      // Load community metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Count players looking today (simplified: count online players)
      const { count: onlineCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);
      
      setPlayersLookingToday(onlineCount || 0);

      // Count matches this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());
      
      setMatchesThisWeek(matchesCount || 0);

      // Load online players (excluding current user)
      const { data: onlinePlayersData } = await supabase
        .from('players')
        .select('*')
        .eq('is_online', true)
        .neq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setOnlinePlayers(onlinePlayersData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscription for online players
    const playersChannel = supabase
      .channel('online-players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: 'is_online=eq.true',
        },
        () => {
          // Reload online players when status changes
          loadDashboardData();
        }
      )
      .subscribe();

    // Set up real-time subscription for match requests
    const requestsChannel = supabase
      .channel('match-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests',
        },
        () => {
          // Reload match requests when they change
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  // Check for matches when play session is active
  useEffect(() => {
    if (!playSession || foundMatch) return;

    const checkForMatches = async () => {
      try {
        // Find compatible players: same skill level, same city, online
        const { data: compatiblePlayers } = await supabase
          .from('players')
          .select('*')
          .eq('is_online', true)
          .eq('skill_level', playSession.skillLevel)
          .ilike('location', `%${playSession.city}%`)
          .neq('user_id', user?.id);

        if (compatiblePlayers && compatiblePlayers.length > 0) {
          // Found a match! Show the first compatible player
          setFoundMatch(compatiblePlayers[0]);
        }
      } catch (error) {
        console.error('Error checking for matches:', error);
      }
    };

    // Check immediately
    checkForMatches();

    // Check every 10 seconds while session is active
    const interval = setInterval(checkForMatches, 10000);

    return () => clearInterval(interval);
  }, [playSession, foundMatch, user]);

  // Handle start play session
  const handleStartPlay = () => {
    setShowPlayModal(true);
  };

  // Handle confirm play session
  const handleConfirmPlaySession = (data: {
    skillLevel: string;
    city: string;
    timeWindow: string;
  }) => {
    setPlaySession(data);
    localStorage.setItem('playSession', JSON.stringify(data));
    setShowPlayModal(false);
    
    // Mark user as online
    if (user) {
      supabase
        .from('players')
        .update({ is_online: true })
        .eq('user_id', user.id);
    }
  };

  // Handle cancel play session
  const handleCancelSession = () => {
    setPlaySession(null);
    setFoundMatch(null);
    localStorage.removeItem('playSession');
    
    // Mark user as offline
    if (user) {
      supabase
        .from('players')
        .update({ is_online: false })
        .eq('user_id', user.id);
    }
  };

  // Handle accept match
  const handleAcceptMatch = async () => {
    if (!foundMatch || !user) return;

    setMatchLoading(true);

    try {
      // Create match request
      const { error: requestError } = await supabase
        .from('match_requests')
        .insert({
          sender_id: user.id,
          receiver_id: foundMatch.user_id,
          status: 'pending',
        });

      if (requestError && requestError.code !== '23505') {
        throw requestError;
      }

      // Create match record
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          player1_id: user.id,
          player2_id: foundMatch.user_id,
          status: 'waiting',
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Clear session and redirect
      setPlaySession(null);
      setFoundMatch(null);
      localStorage.removeItem('playSession');

      router.push(`/match/${match.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept match');
      setMatchLoading(false);
    }
  };

  // Handle decline match
  const handleDeclineMatch = () => {
    setFoundMatch(null);
    // Continue searching
  };

  // Handle match request update
  const handleRequestUpdate = () => {
    loadDashboardData();
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

  return (
    <div className="min-h-screen bg-dark pb-20 md:pb-8">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 bg-dark-lighter/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-heading font-bold gradient-text">
                PadelConnect
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <OnlineToggle 
                  initialStatus={profile.is_online} 
                  onStatusChange={loadDashboardData}
                />
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Hero Action OR Active Play Session */}
        {playSession ? (
          <ActivePlaySession
            session={playSession}
            onCancel={handleCancelSession}
          />
        ) : (
          <HeroAction onStartPlay={handleStartPlay} />
        )}

        {/* 2. Match Found Card */}
        {foundMatch && (
          <MatchFoundCard
            opponent={foundMatch}
            onAccept={handleAcceptMatch}
            onDecline={handleDeclineMatch}
            loading={matchLoading}
          />
        )}

        {/* 3. Match Requests (only if they exist) */}
        {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
          <div className="mb-6">
            <MatchRequestsSection
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              onUpdate={handleRequestUpdate}
            />
          </div>
        )}

        {/* 3.5. Online Players (if not in play session and players are online) */}
        {!playSession && onlinePlayers.length > 0 && (
          <div className="mb-6">
            <div className="glass-card card-shadow p-5">
              <h3 className="text-xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                Online Players ({onlinePlayers.length})
              </h3>
              <PlayerList 
                players={onlinePlayers} 
                currentUserId={user?.id || ''} 
              />
            </div>
          </div>
        )}

        {/* 4. Community Pulse */}
        <CommunityPulse
          playersLookingToday={playersLookingToday}
          matchesThisWeek={matchesThisWeek}
          city={profile?.location}
        />

        {/* 5. Profile Section (simplified) */}
        {profile && (
          <div className="glass-card card-shadow p-5 mb-6" id="profile">
            <h3 className="text-lg font-heading font-semibold text-neutral mb-3">
              Your Profile
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-neutral font-medium">{profile.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Skill Level:</span>
                <span className="skill-badge-intermediate">{profile.skill_level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">City:</span>
                <span className="text-neutral font-medium">{profile.location}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Play Session Modal */}
      <PlaySessionModal
        isOpen={showPlayModal}
        onClose={() => setShowPlayModal(false)}
        onStartSession={handleConfirmPlaySession}
        defaultCity={profile?.location}
        defaultSkillLevel={profile?.skill_level}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
