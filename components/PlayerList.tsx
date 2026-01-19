'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Player List Component
 * 
 * Displays a list of online players with their information.
 * Each player card shows:
 * - Name
 * - Skill level
 * - Location
 * - A "Request Match" button
 */
export default function PlayerList({ players, currentUserId }: { players: any[]; currentUserId: string }) {
  const [requesting, setRequesting] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleRequestMatch = async (playerId: string) => {
    setRequesting(playerId);

    try {
      // Create a match request
      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: playerId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          alert('You already have a pending request with this player.');
        } else {
          alert(error.message || 'Failed to send match request');
        }
      } else {
        alert('Match request sent! The player will see it in their dashboard.');
        router.refresh();
      }
    } catch (err) {
      alert('Failed to send match request');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="bg-neutral rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="mb-4">
            <h3 className="text-xl font-heading font-semibold text-dark mb-2">
              {player.name}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Skill:</span> {player.skill_level}
              </p>
              <p>
                <span className="font-medium">Location:</span> {player.location}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRequestMatch(player.user_id)}
            disabled={requesting === player.user_id}
            className="w-full bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requesting === player.user_id ? 'Sending...' : 'Request Match'}
          </button>
        </div>
      ))}
    </div>
  );
}


