'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { acceptMatchRequest, declineMatchRequest, cancelMatchRequest } from '@/app/actions/matchmaking';
import MatchRequestCard from './MatchRequestCard';
import ConfirmedMatchCard from './ConfirmedMatchCard';
import Link from 'next/link';

/**
 * Requests Dashboard Component
 * 
 * A comprehensive dashboard for managing matchmaking activity with:
 * - Statistics overview
 * - Incoming Requests section
 * - Outgoing Requests section
 * - Confirmed Matches section
 * - Real-time updates
 */
export default function RequestsDashboard({
  incomingRequests: initialIncoming,
  outgoingRequests: initialOutgoing,
  matches: initialMatches,
  stats: initialStats,
  currentUserId,
  isOnline,
}: {
  incomingRequests: any[];
  outgoingRequests: any[];
  matches: any[];
  stats: {
    pendingIncoming: number;
    pendingOutgoing: number;
    confirmedMatches: number;
    totalMatches: number;
    acceptedRequests: number;
    rejectedRequests: number;
  };
  currentUserId: string;
  isOnline: boolean;
}) {
  const [incomingRequests, setIncomingRequests] = useState(initialIncoming);
  const [outgoingRequests, setOutgoingRequests] = useState(initialOutgoing);
  const [matches, setMatches] = useState(initialMatches);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'matches'>('incoming');
  const supabase = createClient();
  const router = useRouter();

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to match_requests changes
    const requestsChannel = supabase
      .channel('match-requests-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_requests',
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel('matches-dashboard')
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
    setStats(initialStats);
  }, [initialIncoming, initialOutgoing, initialMatches, initialStats]);

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

  // Auto-select tab based on content
  useEffect(() => {
    if (pendingIncoming.length > 0 && activeTab === 'incoming') return;
    if (pendingOutgoing.length > 0 && activeTab === 'outgoing') return;
    if (matches.length > 0 && activeTab === 'matches') return;
    
    if (pendingIncoming.length > 0) setActiveTab('incoming');
    else if (pendingOutgoing.length > 0) setActiveTab('outgoing');
    else if (matches.length > 0) setActiveTab('matches');
  }, [pendingIncoming.length, pendingOutgoing.length, matches.length, activeTab]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Incoming Requests</p>
              <p className="text-3xl font-bold text-primary">{stats.pendingIncoming}</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Outgoing Requests</p>
              <p className="text-3xl font-bold text-secondary">{stats.pendingOutgoing}</p>
            </div>
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg p-6 border border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Matches</p>
              <p className="text-3xl font-bold text-accent">{stats.confirmedMatches}</p>
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700/20 to-gray-600/10 rounded-lg p-6 border border-gray-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Matches</p>
              <p className="text-3xl font-bold text-neutral">{stats.totalMatches}</p>
            </div>
            <div className="w-12 h-12 bg-gray-600/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Online Status Warning */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-yellow-800">
            <strong>You're offline.</strong> Toggle your online status in the header to send and receive match requests.
          </p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'incoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Incoming Requests
            {pendingIncoming.length > 0 && (
              <span className="ml-2 bg-primary text-neutral text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingIncoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'outgoing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Your Requests
            {pendingOutgoing.length > 0 && (
              <span className="ml-2 bg-secondary text-neutral text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingOutgoing.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'matches'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Confirmed Matches
            {matches.length > 0 && (
              <span className="ml-2 bg-accent text-neutral text-xs font-bold px-2 py-0.5 rounded-full">
                {matches.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-neutral flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                Incoming Match Requests
              </h2>
              <Link
                href="/dashboard"
                className="text-sm text-primary hover:underline"
              >
                Browse Players →
              </Link>
            </div>
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
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No incoming requests at the moment.</p>
                <p className="text-sm text-gray-500 mb-4">Other players can send you requests when you're online.</p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-primary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Online Players
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-neutral flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                Your Match Requests
              </h2>
              <Link
                href="/dashboard"
                className="text-sm text-primary hover:underline"
              >
                Send More Requests →
              </Link>
            </div>
            {pendingOutgoing.length > 0 ? (
              <div className="space-y-3 mb-6">
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
              <div className="bg-neutral rounded-lg shadow p-6 text-center mb-6">
                <p className="text-gray-600">No active outgoing requests.</p>
              </div>
            )}

            {/* Request History */}
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
        )}

        {/* Confirmed Matches Tab */}
        {activeTab === 'matches' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-neutral flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                Confirmed Matches
              </h2>
            </div>
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
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No confirmed matches yet.</p>
                <p className="text-sm text-gray-500 mb-4">Accept a match request to start playing!</p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-primary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Online Players
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

