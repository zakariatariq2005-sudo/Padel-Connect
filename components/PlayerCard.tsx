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
    <div className="bg-neutral rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border border-gray-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-heading font-semibold text-dark">
            {player.name}
          </h3>
          <span className="w-2 h-2 bg-secondary rounded-full" title="Online"></span>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
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

