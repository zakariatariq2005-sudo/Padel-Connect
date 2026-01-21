'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { acceptMatchRequest, declineMatchRequest, cancelMatchRequest } from '@/app/actions/matchmaking';
import MatchRequestCard from './MatchRequestCard';
import ConfirmedMatchCard from './ConfirmedMatchCard';

/**
 * Requests Client Component
 * 
 * Handles real-time updates for the requests page.
 * Subscribes to changes in match_requests and matches tables.
 */
export default function RequestsClient({
  incomingRequests: initialIncoming,
  outgoingRequests: initialOutgoing,
  matches: initialMatches,
  currentUserId,
}: {
  incomingRequests: any[];
  outgoingRequests: any[];
  matches: any[];
  currentUserId: string;
}) {
  const [incomingRequests, setIncomingRequests] = useState(initialIncoming);
  const [outgoingRequests, setOutgoingRequests] = useState(initialOutgoing);
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to match_requests changes
    const requestsChannel = supabase
      .channel('match-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests',
        },
        () => {
          // Reload page data when requests change
          router.refresh();
        }
      )
      .subscribe();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [supabase, router]);

  // Update state when props change (from server refresh)
  useEffect(() => {
    setIncomingRequests(initialIncoming);
    setOutgoingRequests(initialOutgoing);
    setMatches(initialMatches);
  }, [initialIncoming, initialOutgoing, initialMatches]);

  const handleAccept = async (requestId: string) => {
    setLoading(`accept-${requestId}`);
    const result = await acceptMatchRequest(requestId);
    
    if (result.success && result.data?.match) {
      router.push(`/match/${result.data.match.id}`);
    } else {
      alert(result.error || 'Failed to accept request');
      router.refresh();
    }
    setLoading(null);
  };

  const handleDecline = async (requestId: string) => {
    setLoading(`decline-${requestId}`);
    const result = await declineMatchRequest(requestId);
    
    if (!result.success) {
      alert(result.error || 'Failed to decline request');
    }
    
    router.refresh();
    setLoading(null);
  };

  const handleCancel = async (requestId: string) => {
    setLoading(`cancel-${requestId}`);
    const result = await cancelMatchRequest(requestId);
    
    if (!result.success) {
      alert(result.error || 'Failed to cancel request');
    }
    
    router.refresh();
    setLoading(null);
  };

  // Filter requests by status
  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  const pendingOutgoing = outgoingRequests.filter(r => r.status === 'pending');
  const otherOutgoing = outgoingRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Incoming Requests Section */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
          Incoming Requests
        </h2>
        {pendingIncoming.length > 0 ? (
          <div className="space-y-3">
            {pendingIncoming.map((request) => (
              <MatchRequestCard
                key={request.id}
                request={request}
                type="incoming"
                player={request.sender}
                onAccept={() => handleAccept(request.id)}
                onDecline={() => handleDecline(request.id)}
                loading={loading}
              />
            ))}
          </div>
        ) : (
          <div className="bg-neutral rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No incoming requests at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Other players can send you requests when you're online.</p>
          </div>
        )}
      </section>

      {/* Outgoing Requests Section */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
          Your Requests
        </h2>
        {pendingOutgoing.length > 0 ? (
          <div className="space-y-3 mb-4">
            {pendingOutgoing.map((request) => (
              <MatchRequestCard
                key={request.id}
                request={request}
                type="outgoing"
                player={request.receiver}
                onCancel={() => handleCancel(request.id)}
                loading={loading}
                expiresAt={request.expires_at}
              />
            ))}
          </div>
        ) : (
          <div className="bg-neutral rounded-lg shadow p-6 text-center mb-4">
            <p className="text-gray-600 text-sm">No active outgoing requests.</p>
          </div>
        )}

        {/* Show history of other outgoing requests */}
        {otherOutgoing.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-3">Request History</h3>
            <div className="space-y-2">
              {otherOutgoing.map((request) => (
                <MatchRequestCard
                  key={request.id}
                  request={request}
                  type="outgoing"
                  player={request.receiver}
                  loading={null}
                  expiresAt={request.expires_at}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Confirmed Matches Section */}
      <section>
        <h2 className="text-2xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
          Confirmed Matches
        </h2>
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <ConfirmedMatchCard
                key={match.id}
                match={match}
                opponent={match.opponent}
              />
            ))}
          </div>
        ) : (
          <div className="bg-neutral rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No confirmed matches yet.</p>
            <p className="text-sm text-gray-500 mt-2">Accept a match request to start playing!</p>
          </div>
        )}
      </section>
    </div>
  );
}

