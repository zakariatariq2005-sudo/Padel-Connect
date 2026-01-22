'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { acceptMatchRequest, declineMatchRequest, cancelMatchRequest } from '@/app/actions/matchmaking';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { formatDistanceToNow } from 'date-fns';

/**
 * Requests Page
 * 
 * Shows three sections:
 * 1. Incoming Requests
 * 2. Outgoing Requests
 * 3. Confirmed Matches
 * 
 * All existing handlers preserved - only UI structure rebuilt.
 */
export default function RequestsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        // Load profile
        const { data: profileData } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        setProfile(profileData);

        // Expire old requests
        await supabase
          .from('match_requests')
          .update({ status: 'expired' })
          .eq('status', 'pending')
          .lt('expires_at', new Date().toISOString());

        // Load incoming requests
        const { data: incomingData } = await supabase
          .from('match_requests')
          .select('*')
          .eq('receiver_id', authUser.id)
          .in('status', ['pending', 'accepted'])
          .order('created_at', { ascending: false });

        // Load outgoing requests
        const { data: outgoingData } = await supabase
          .from('match_requests')
          .select('*')
          .eq('sender_id', authUser.id)
          .in('status', ['pending', 'accepted', 'rejected', 'expired', 'cancelled'])
          .order('created_at', { ascending: false });

        // Load matches
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*')
          .or(`player1_id.eq.${authUser.id},player2_id.eq.${authUser.id}`)
          .in('status', ['waiting', 'in_progress'])
          .order('created_at', { ascending: false });

        // Fetch player profiles
        const userIds = new Set<string>();
        (incomingData || []).forEach((r: any) => userIds.add(r.sender_id));
        (outgoingData || []).forEach((r: any) => userIds.add(r.receiver_id));
        (matchesData || []).forEach((m: any) => {
          userIds.add(m.player1_id);
          userIds.add(m.player2_id);
        });

        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .in('user_id', Array.from(userIds));

        const playersMap = new Map((playersData || []).map((p: any) => [p.user_id, p]));

        setIncomingRequests((incomingData || []).map((r: any) => ({
          ...r,
          sender: playersMap.get(r.sender_id),
        })));

        setOutgoingRequests((outgoingData || []).map((r: any) => ({
          ...r,
          receiver: playersMap.get(r.receiver_id),
        })));

        setMatches((matchesData || []).map((m: any) => {
          const opponentId = m.player1_id === authUser.id ? m.player2_id : m.player1_id;
          return {
            ...m,
            opponent: playersMap.get(opponentId),
          };
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error loading requests:', error);
        router.push('/login');
      }
    };

    loadRequests();
  }, [router, supabase]);

  const handleAccept = async (requestId: string) => {
    setActionLoading(`accept-${requestId}`);
    const result = await acceptMatchRequest(requestId);
    
    if (result.success && result.data?.match) {
      router.push(`/match/${result.data.match.id}`);
    } else {
      alert(result.error || 'Failed to accept request');
      router.refresh();
    }
    setActionLoading(null);
  };

  const handleDecline = async (requestId: string) => {
    setActionLoading(`decline-${requestId}`);
    const result = await declineMatchRequest(requestId);
    
    if (!result.success) {
      alert(result.error || 'Failed to decline request');
    }
    
    router.refresh();
    setActionLoading(null);
  };

  const handleCancel = async (requestId: string) => {
    setActionLoading(`cancel-${requestId}`);
    const result = await cancelMatchRequest(requestId);
    
    if (!result.success) {
      alert(result.error || 'Failed to cancel request');
    }
    
    router.refresh();
    setActionLoading(null);
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

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  const pendingOutgoing = outgoingRequests.filter(r => r.status === 'pending');
  const otherOutgoing = outgoingRequests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-dark pb-20 md:pb-0">
      <Header isOnline={profile?.is_online || false} />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Incoming Requests Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-neutral mb-4">
            Incoming Requests
          </h2>
          
          {pendingIncoming.length > 0 ? (
            <div className="space-y-3">
              {pendingIncoming.map((request) => (
                <div
                  key={request.id}
                  className="bg-dark-light rounded-lg shadow p-5 border border-dark-lighter text-center"
                >
                  <div className="mb-4">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-3">
                      {request.sender?.photo_url ? (
                        <img
                          src={request.sender.photo_url}
                          alt={request.sender.nickname || 'Player'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-dark-lighter flex items-center justify-center border-2 border-dark-lighter">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral mb-1">
                      {request.sender?.nickname || 'Unknown Player'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="font-medium">Skill:</span> {request.sender?.skill_level || 'N/A'}</p>
                      <p><span className="font-medium">City:</span> {request.sender?.location || 'N/A'}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === `accept-${request.id}` ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 bg-gray-600 text-neutral font-medium py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === `decline-${request.id}` ? 'Declining...' : 'Decline'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-light rounded-lg shadow p-8 border border-dark-lighter text-center">
              <p className="text-gray-300">No incoming requests at the moment.</p>
            </div>
          )}
        </section>

        {/* Outgoing Requests Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-neutral mb-4">
            Your Requests
          </h2>
          
          {pendingOutgoing.length > 0 ? (
            <div className="space-y-3 mb-4">
              {pendingOutgoing.map((request) => (
                <div
                  key={request.id}
                  className="bg-dark-light rounded-lg shadow p-5 border border-dark-lighter text-center"
                >
                  <div className="mb-4">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-3">
                      {request.receiver?.photo_url ? (
                        <img
                          src={request.receiver.photo_url}
                          alt={request.receiver.nickname || 'Player'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-dark-lighter flex items-center justify-center border-2 border-dark-lighter">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral mb-1">
                      {request.receiver?.nickname || 'Unknown Player'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="font-medium">Skill:</span> {request.receiver?.skill_level || 'N/A'}</p>
                      <p><span className="font-medium">City:</span> {request.receiver?.location || 'N/A'}</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-2">
                        Pending
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(request.id)}
                    disabled={actionLoading !== null}
                    className="w-full bg-gray-600 text-neutral font-medium py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === `cancel-${request.id}` ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-light rounded-lg shadow p-6 border border-dark-lighter text-center mb-4">
              <p className="text-gray-300 text-sm">No active outgoing requests.</p>
            </div>
          )}

          {/* Request History */}
          {otherOutgoing.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-400 mb-3">Request History</h3>
              <div className="space-y-2">
                {otherOutgoing.map((request) => {
                  const statusColors: Record<string, string> = {
                    accepted: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800',
                    expired: 'bg-gray-100 text-gray-800',
                    cancelled: 'bg-gray-100 text-gray-800',
                  };
                  
                  return (
                    <div
                      key={request.id}
                      className="bg-dark-light rounded-lg shadow p-4 border border-dark-lighter text-center"
                    >
                      <p className="font-medium text-neutral mb-2">{request.receiver?.nickname || 'Unknown Player'}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Confirmed Matches Section */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-neutral mb-4">
            Confirmed Matches
          </h2>
          
          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="bg-dark-light rounded-lg shadow p-5 border border-dark-lighter text-center"
                >
                  <div className="mb-4">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-3">
                      {match.opponent?.photo_url ? (
                        <img
                          src={match.opponent.photo_url}
                          alt={match.opponent.nickname || 'Player'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-dark-lighter flex items-center justify-center border-2 border-dark-lighter">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral mb-1">
                      Match with {match.opponent?.nickname || 'Unknown Player'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><span className="font-medium">Skill:</span> {match.opponent?.skill_level || 'N/A'}</p>
                      <p><span className="font-medium">City:</span> {match.opponent?.location || 'N/A'}</p>
                      {match.created_at && (
                        <p className="text-xs text-gray-400">
                          Created {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/match/${match.id}`)}
                      className="w-full bg-primary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
                    >
                      View Match
                    </button>
                    {/* TODO: Implement chat functionality */}
                    <button
                      disabled
                      className="w-full bg-gray-600 text-neutral font-medium py-2 px-4 rounded-lg opacity-50 cursor-not-allowed"
                    >
                      Open Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-light rounded-lg shadow p-8 border border-dark-lighter text-center">
              <p className="text-gray-300">No confirmed matches yet.</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

