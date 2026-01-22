'use client';

/**
 * Player Card Component
 * 
 * Displays a single player with their info and request button.
 * Connects to existing sendMatchRequest handler.
 */
export default function PlayerCard({
  player,
  onRequestMatch,
  isRequesting,
}: {
  player: any;
  onRequestMatch: (playerId: string) => void;
  isRequesting: boolean;
}) {
  return (
    <div className="bg-dark-light rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border border-dark-lighter text-center">
      <div className="mb-4">
        {/* Profile Photo */}
        <div className="flex justify-center mb-3">
          {player.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.nickname || 'Player'}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-dark-lighter flex items-center justify-center border-2 border-dark-lighter">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg font-heading font-semibold text-neutral">
            {player.nickname || 'Unknown Player'}
          </h3>
          <span className="w-2 h-2 bg-secondary rounded-full" title="Online"></span>
        </div>
        <div className="space-y-1 text-sm text-gray-300">
          <p>
            <span className="font-medium">Skill:</span> {player.skill_level}
          </p>
          <p>
            <span className="font-medium">City:</span> {player.location}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRequestMatch(player.user_id)}
        disabled={isRequesting}
        className="w-full bg-secondary text-neutral font-medium py-2.5 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRequesting ? 'Sending...' : 'Request Match'}
      </button>
    </div>
  );
}

