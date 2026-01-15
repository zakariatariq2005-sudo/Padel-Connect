'use client';

import { useRouter } from 'next/navigation';

/**
 * Active Match Section Component
 * 
 * Premium card displaying active match information:
 * - Opponent details
 * - Match status
 * - View match button
 */
export default function ActiveMatchSection({
  match,
  opponent,
  currentUserId,
}: {
  match: any;
  opponent: any;
  currentUserId: string;
}) {
  const router = useRouter();

  if (!match || !opponent) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'finished':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="glass-card card-shadow p-6 mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-heading font-bold text-neutral mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Active Match
          </h3>
          <p className="text-gray-300">
            Playing with <span className="font-semibold text-neutral">{opponent.name}</span>
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(
            match.status
          )}`}
        >
          {match.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="glass-card p-4 mb-4 bg-dark-lighter/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral mb-1">{opponent.name}</p>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {opponent.skill_level && (
                <span className="skill-badge-intermediate">
                  {opponent.skill_level}
                </span>
              )}
              {opponent.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {opponent.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-sm text-gray-300 font-medium">Online</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/match/${match.id}`)}
        className="btn-primary w-full"
      >
        View Match Details
      </button>
    </div>
  );
}
