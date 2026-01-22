'use client';

import { formatDistanceToNow } from 'date-fns';

/**
 * Match Request Card Component
 * 
 * Displays a single match request with appropriate actions based on type.
 */
export default function MatchRequestCard({
  request,
  type,
  player,
  onAccept,
  onDecline,
  onCancel,
  loading,
  expiresAt,
}: {
  request: any;
  type: 'incoming' | 'outgoing';
  player: any;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  loading: string | null;
  expiresAt?: string;
}) {
  const requestId = request.id;
  const isLoading = loading?.startsWith(type === 'incoming' ? 'accept' : 'cancel') && loading.includes(requestId);

  // Calculate time remaining
  let timeRemaining = null;
  if (expiresAt && request.status === 'pending') {
    try {
      const expires = new Date(expiresAt);
      const now = new Date();
      if (expires > now) {
        timeRemaining = formatDistanceToNow(expires, { addSuffix: true });
      }
    } catch (e) {
      // Ignore date parsing errors
    }
  }

  // Status badge
  const getStatusBadge = () => {
    if (request.status === 'accepted') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Accepted</span>;
    }
    if (request.status === 'rejected') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Declined</span>;
    }
    if (request.status === 'expired') {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Expired</span>;
    }
    if (request.status === 'cancelled') {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Cancelled</span>;
    }
    return null;
  };

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-heading font-semibold text-dark">
              {player?.nickname || 'Unknown Player'}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Skill:</span> {player?.skill_level || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Location:</span> {player?.location || 'N/A'}
            </p>
            {timeRemaining && (
              <p className="text-xs text-gray-500 mt-2">
                Expires {timeRemaining}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {type === 'incoming' && request.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === `accept-${requestId}` ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={onDecline}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-dark font-medium py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === `decline-${requestId}` ? 'Declining...' : 'Decline'}
          </button>
        </div>
      )}

      {type === 'outgoing' && request.status === 'pending' && (
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="w-full bg-gray-200 text-dark font-medium py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === `cancel-${requestId}` ? 'Cancelling...' : 'Cancel Request'}
        </button>
      )}

      {type === 'outgoing' && request.status !== 'pending' && (
        <p className="text-sm text-gray-500 text-center">
          {request.status === 'accepted' && 'Match confirmed! Check your confirmed matches.'}
          {request.status === 'rejected' && 'This request was declined.'}
          {request.status === 'expired' && 'This request expired.'}
          {request.status === 'cancelled' && 'You cancelled this request.'}
        </p>
      )}
    </div>
  );
}



