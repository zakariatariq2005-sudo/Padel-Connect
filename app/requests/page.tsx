import { redirect } from 'next/navigation';
import { requireAuth, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import OnlineToggle from '@/components/OnlineToggle';
import RequestsDashboard from '@/components/RequestsDashboard';
import Link from 'next/link';

/**
 * Requests Dashboard (Server Component)
 * 
 * A dedicated dashboard for managing all matchmaking activity:
 * - Statistics and overview
 * - Incoming Match Requests (with Accept/Decline actions)
 * - Outgoing Match Requests (with Cancel option)
 * - Confirmed Matches (after acceptance)
 * - Request history
 * 
 * All sections update in real-time using Supabase Realtime.
 */
export default async function RequestsDashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile();
  const supabase = await createClient();

  // Expire old requests first
  await supabase
    .from('match_requests')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  // Fetch incoming requests (requests sent TO current user)
  const { data: incomingRequestsData } = await supabase
    .from('match_requests')
    .select('*')
    .eq('receiver_id', user.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false });

  // Fetch outgoing requests (requests sent BY current user)
  const { data: outgoingRequestsData } = await supabase
    .from('match_requests')
    .select('*')
    .eq('sender_id', user.id)
    .in('status', ['pending', 'accepted', 'rejected', 'expired', 'cancelled'])
    .order('created_at', { ascending: false });

  // Fetch confirmed matches (where request was accepted)
  const { data: matchesData } = await supabase
    .from('matches')
    .select('*')
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .in('status', ['waiting', 'in_progress'])
    .order('created_at', { ascending: false });

  // Fetch all match history for statistics
  const { data: allMatchesData } = await supabase
    .from('matches')
    .select('*')
    .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50);

  // Collect all user IDs we need to fetch
  const userIdsToFetch = new Set<string>();
  (incomingRequestsData || []).forEach((req: any) => userIdsToFetch.add(req.sender_id));
  (outgoingRequestsData || []).forEach((req: any) => userIdsToFetch.add(req.receiver_id));
  (matchesData || []).forEach((match: any) => {
    userIdsToFetch.add(match.player1_id);
    userIdsToFetch.add(match.player2_id);
  });

  // Fetch all player profiles in one query
  const { data: allPlayers } = await supabase
    .from('players')
    .select('*')
    .in('user_id', Array.from(userIdsToFetch));

  // Create a map for quick lookup
  const playersMap = new Map((allPlayers || []).map((p: any) => [p.user_id, p]));

  // Attach player profiles to requests
  const incomingRequests = (incomingRequestsData || []).map((request: any) => ({
    ...request,
    sender: playersMap.get(request.sender_id),
  }));

  const outgoingRequests = (outgoingRequestsData || []).map((request: any) => ({
    ...request,
    receiver: playersMap.get(request.receiver_id),
  }));

  // Attach opponent info to matches
  const matches = (matchesData || []).map((match: any) => {
    const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;
    return {
      ...match,
      opponent: playersMap.get(opponentId),
    };
  });

  // Calculate statistics
  const stats = {
    pendingIncoming: incomingRequests.filter(r => r.status === 'pending').length,
    pendingOutgoing: outgoingRequests.filter(r => r.status === 'pending').length,
    confirmedMatches: matches.length,
    totalMatches: allMatchesData?.length || 0,
    acceptedRequests: outgoingRequests.filter(r => r.status === 'accepted').length,
    rejectedRequests: outgoingRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-neutral border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
              >
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-primary">Match Requests Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your matchmaking activity</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
        <RequestsDashboard
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          matches={matches}
          stats={stats}
          currentUserId={user.id}
          isOnline={profile?.is_online || false}
        />
      </main>
    </div>
  );
}
