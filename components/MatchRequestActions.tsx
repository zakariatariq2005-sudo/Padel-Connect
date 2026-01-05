'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Match Request Actions Component
 * 
 * Provides Accept and Reject buttons for incoming match requests.
 * When a request is accepted, a match is created and both players
 * are redirected to the live match page.
 */
export default function MatchRequestActions({ requestId, senderId }: { requestId: string; senderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async () => {
    setLoading('accept');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update request status to accepted
      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create a match record
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          player1_id: senderId,
          player2_id: user.id,
          status: 'waiting',
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Redirect to live match page
      router.push(`/match/${match.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');

    try {
      const { error } = await supabase
        .from('match_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAccept}
        disabled={loading !== null}
        className="bg-secondary text-neutral font-medium py-1.5 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading === 'accept' ? 'Accepting...' : 'Accept'}
      </button>
      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="bg-gray-200 text-dark font-medium py-1.5 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  );
}

