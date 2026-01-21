'use client';

/**
 * Match Found Card Component
 * 
 * Shows when a compatible player is found during an active play session.
 * Displays opponent info with Accept/Decline buttons.
 */
export default function MatchFoundCard({
  opponent,
  onAccept,
  onDecline,
  loading,
}: {
  opponent: {
    name: string;
    skill_level: string;
    location: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  loading: boolean;
}) {
  const getSkillBadge = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'skill-badge-beginner';
      case 'Intermediate':
        return 'skill-badge-intermediate';
      case 'Advanced':
        return 'skill-badge-advanced';
      case 'Professional':
        return 'skill-badge-professional';
      default:
        return 'skill-badge-beginner';
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="glass-card card-shadow p-6 md:p-8 mb-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-secondary/10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-secondary mb-4 animate-pulse">
          <span className="text-2xl">🎾</span>
        </div>
        <h3 className="text-2xl font-heading font-bold text-neutral mb-2">
          Match Found!
        </h3>
        <p className="text-gray-400">
          We found a player matching your availability
        </p>
      </div>

      <div className="glass-card p-5 mb-6 bg-dark-lighter/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent 
                        flex items-center justify-center text-white font-bold text-xl
                        shadow-lg shadow-primary/30">
            {getAvatarInitials(opponent.name)}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-heading font-semibold text-neutral mb-1">
              {opponent.name}
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={getSkillBadge(opponent.skill_level)}>
                {opponent.skill_level}
              </span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {opponent.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          {loading ? 'Accepting...' : 'Accept Match'}
        </button>
        <button
          onClick={onDecline}
          disabled={loading}
          className="px-6 py-3 bg-dark-lighter text-gray-300 font-semibold rounded-xl 
                   hover:bg-dark-lighter/80 border border-white/10
                   transition-all duration-200 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Decline
        </button>
      </div>
    </div>
  );
}







