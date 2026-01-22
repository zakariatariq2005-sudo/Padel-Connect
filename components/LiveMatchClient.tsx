'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Live Match Client Component
 * 
 * This component handles real-time match status updates using Supabase Realtime.
 * It subscribes to changes in the match record and updates the UI instantly
 * when the status changes (e.g., from "Waiting" to "In Progress" to "Finished").
 * 
 * Key features:
 * - Real-time status updates via Supabase Realtime subscription
 * - Displays both players' information and skill levels
 * - Shows current match status
 * - Allows status updates (if you want to add admin controls)
 */
export default function LiveMatchClient({ 
  matchId, 
  match, 
  currentPlayer, 
  opponent,
  currentUserId 
}: { 
  matchId: string; 
  match: any; 
  currentPlayer: any; 
  opponent: any;
  currentUserId: string;
}) {
  const [matchStatus, setMatchStatus] = useState(match.status);
  const [updatedMatch, setUpdatedMatch] = useState(match);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to real-time updates for this match
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          // When the match is updated, update local state
          setUpdatedMatch(payload.new as any);
          setMatchStatus((payload.new as any).status);
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase]);

  // Get status color based on match status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'finished':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Status Badge */}
      <div className="flex justify-center">
        <div className={`px-6 py-3 rounded-full border-2 font-heading font-semibold text-lg ${getStatusColor(matchStatus)}`}>
          {matchStatus === 'waiting' && '⏳ Waiting'}
          {matchStatus === 'in_progress' && '🎾 In Progress'}
          {matchStatus === 'finished' && '✅ Finished'}
        </div>
      </div>

      {/* Players Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Player Card */}
        <div className="bg-neutral rounded-lg shadow-xl p-6 border-2 border-primary">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-block bg-primary text-neutral text-xs font-semibold px-3 py-1 rounded-full mb-2">
                You
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-2">
              {currentPlayer?.name || 'Player 1'}
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Skill Level:</span> {currentPlayer?.skill_level || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Location:</span> {currentPlayer?.location || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Opponent Card */}
        <div className="bg-neutral rounded-lg shadow-xl p-6 border-2 border-secondary">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-block bg-secondary text-neutral text-xs font-semibold px-3 py-1 rounded-full mb-2">
                Opponent
              </span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-2">
              {opponent?.nickname || 'Player 2'}
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Skill Level:</span> {opponent?.skill_level || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Location:</span> {opponent?.location || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="bg-neutral rounded-lg shadow p-6">
        <h3 className="text-lg font-heading font-semibold text-dark mb-4">Match Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Match ID:</span> {matchId}
          </p>
          <p>
            <span className="font-medium">Status:</span> {matchStatus}
          </p>
          <p>
            <span className="font-medium">Created:</span> {new Date(updatedMatch.created_at).toLocaleString()}
          </p>
          {updatedMatch.updated_at && (
            <p>
              <span className="font-medium">Last Updated:</span> {new Date(updatedMatch.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary text-neutral font-medium py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}


