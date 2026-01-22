'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

/**
 * Confirmed Match Card Component
 * 
 * Displays a confirmed match with opponent info and action buttons.
 */
export default function ConfirmedMatchCard({
  match,
  opponent,
}: {
  match: any;
  opponent: any;
}) {
  const router = useRouter();

  const handleViewMatch = () => {
    router.push(`/match/${match.id}`);
  };

  const handleChat = () => {
    // Placeholder for future chat functionality
    alert('Chat feature coming soon!');
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg shadow-lg p-6 border border-primary/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-heading font-semibold text-neutral">
              Match with {opponent?.nickname || 'Unknown Player'}
            </h3>
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {match.status === 'waiting' ? 'Waiting' : 'In Progress'}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-400">
            <p>
              <span className="font-medium">Skill:</span> {opponent?.skill_level || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Location:</span> {opponent?.location || 'N/A'}
            </p>
            {match.started_at && (
              <p className="text-xs text-gray-500 mt-2">
                Started {format(new Date(match.started_at), 'PPp')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleViewMatch}
          className="flex-1 bg-primary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
        >
          View Match
        </button>
        <button
          onClick={handleChat}
          className="flex-1 bg-neutral text-dark font-medium py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition border border-gray-300"
        >
          Chat
        </button>
      </div>
    </div>
  );
}



