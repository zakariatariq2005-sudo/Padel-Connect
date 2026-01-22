'use client';

/**
 * User Status Card Component
 * 
 * Premium profile card displaying:
 * - Name
 * - Skill level (with color-coded badge)
 * - City/Location
 * - Online status indicator
 */
export default function UserStatusCard({ 
  profile 
}: { 
  profile: {
    name?: string;
    nickname?: string;
    skill_level: string;
    location: string;
    is_online: boolean;
  } | null;
}) {
  if (!profile) {
    return (
      <div className="glass-card card-shadow p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    );
  }

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
    <div className="glass-card card-shadow p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-heading font-bold text-neutral mb-3">
            {profile.nickname || 'Unknown Player'}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={getSkillBadge(profile.skill_level)}>
              {profile.skill_level}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${profile.is_online ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-500'}
          `} />
          <span className="text-sm text-gray-300 font-medium">
            {profile.is_online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
