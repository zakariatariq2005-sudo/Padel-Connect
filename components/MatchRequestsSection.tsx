'use client';

import MatchRequestActions from './MatchRequestActions';

/**
 * Match Requests Section Component
 * 
 * Displays:
 * - Incoming match requests (with Accept/Reject buttons)
 * - Sent match requests (with status indicators)
 * - Premium card design
 */
export default function MatchRequestsSection({
  incomingRequests,
  outgoingRequests,
  onUpdate,
}: {
  incomingRequests: any[];
  outgoingRequests: any[];
  onUpdate: () => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // This component only renders when requests exist (checked in parent)

  return (
    <div className="space-y-6 mb-6" id="requests">
      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></span>
            Incoming Match Requests
          </h3>
          <div className="space-y-3">
            {incomingRequests.map((request: any) => (
              <div
                key={request.id}
                className="glass-card card-shadow p-5 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral mb-1">
                      {request.sender?.name || 'Unknown Player'} wants to play with you
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      {request.sender?.skill_level && (
                        <span className="skill-badge-intermediate">
                          {request.sender.skill_level}
                        </span>
                      )}
                      {request.sender?.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {request.sender.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <MatchRequestActions
                    requestId={request.id}
                    senderId={request.sender_id}
                    onUpdate={onUpdate}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-heading font-bold text-neutral mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-secondary to-green-400 rounded-full"></span>
            Your Match Requests
          </h3>
          <div className="space-y-3">
            {outgoingRequests.map((request: any) => (
              <div
                key={request.id}
                className="glass-card card-shadow p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral mb-1">
                      You requested to play with {request.receiver?.name || 'Unknown Player'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      {request.receiver?.skill_level && (
                        <span className="skill-badge-intermediate">
                          {request.receiver.skill_level}
                        </span>
                      )}
                      {request.receiver?.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {request.receiver.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
