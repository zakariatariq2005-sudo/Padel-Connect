'use client';

/**
 * Active Play Session Component
 * 
 * Shows when user has an active play session (searching for players).
 * Replaces the hero action card.
 */
export default function ActivePlaySession({
  session,
  onCancel,
}: {
  session: {
    skillLevel: string;
    city: string;
    timeWindow: string;
  };
  onCancel: () => void;
}) {
  const getTimeWindowLabel = (window: string) => {
    switch (window) {
      case 'now':
        return 'Now';
      case 'today':
        return 'Later today';
      case 'week':
        return 'This week';
      default:
        return window;
    }
  };

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

  return (
    <div className="glass-card card-shadow p-6 md:p-8 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-heading font-bold text-neutral mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Looking for players…
          </h3>
          <p className="text-gray-400 mb-4">
            We'll notify you when someone matches your availability.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          Searching
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Skill:</span>
          <span className={getSkillBadge(session.skillLevel)}>
            {session.skillLevel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">City:</span>
          <span className="text-neutral font-medium">{session.city}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Time:</span>
          <span className="text-neutral font-medium">{getTimeWindowLabel(session.timeWindow)}</span>
        </div>
      </div>

      {/* Animated indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className="text-sm text-gray-400">Searching for matches...</span>
      </div>

      <button
        onClick={onCancel}
        className="px-4 py-2 bg-dark-lighter text-gray-300 font-semibold rounded-xl 
                 hover:bg-dark-lighter/80 border border-white/10
                 transition-all duration-200 active:scale-95"
      >
        Cancel session
      </button>
    </div>
  );
}


