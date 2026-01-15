'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Match Request Actions Component
 * 
 * Premium Accept/Reject buttons for incoming match requests.
 * When accepted, creates a match and redirects to live match page.
 */
export default function MatchRequestActions({ 
  requestId, 
  senderId,
  onUpdate 
}: { 
  requestId: string; 
  senderId: string;
  onUpdate?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async () => {
    setLoading('accept');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('match_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

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

      router.push(`/match/${match.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
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

      if (onUpdate) {
        onUpdate();
      } else {
        router.refresh();
      }
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
        className="btn-secondary text-sm px-4 py-2"
      >
        {loading === 'accept' ? 'Accepting...' : 'Accept'}
      </button>
      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="px-4 py-2 bg-dark-lighter text-gray-300 font-semibold rounded-xl 
                 hover:bg-dark-lighter/80 border border-white/10
                 transition-all duration-200 active:scale-95
                 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  );
}
