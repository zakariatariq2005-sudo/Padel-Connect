'use client';

/**
 * Community Pulse Component
 * 
 * Social proof section showing activity metrics.
 * Helps avoid the "dead app" feeling.
 */
export default function CommunityPulse({
  playersLookingToday,
  matchesThisWeek,
  city,
}: {
  playersLookingToday: number;
  matchesThisWeek: number;
  city?: string;
}) {
  return (
    <div className="glass-card card-shadow p-6 mb-6">
      <h3 className="text-lg font-heading font-semibold text-neutral mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Community Pulse
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-xl">👥</span>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-neutral">
              {playersLookingToday}
            </p>
            <p className="text-sm text-gray-400">
              {playersLookingToday === 1 ? 'player' : 'players'} looking to play today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-green-400/20 flex items-center justify-center">
            <span className="text-xl">🎾</span>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-neutral">
              {matchesThisWeek}
            </p>
            <p className="text-sm text-gray-400">
              {matchesThisWeek === 1 ? 'match' : 'matches'} created this week
              {city && ` in ${city}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}







