'use client';

/**
 * Filters Section Component
 * 
 * Modern filter UI with:
 * - Skill level filter (pills)
 * - City filter (text input)
 * - Smooth animations
 */
export default function FiltersSection({
  selectedSkill,
  selectedCity,
  onSkillChange,
  onCityChange,
}: {
  selectedSkill: string;
  selectedCity: string;
  onSkillChange: (skill: string) => void;
  onCityChange: (city: string) => void;
}) {
  const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

  return (
    <div className="glass-card card-shadow p-5 mb-6">
      <h3 className="text-lg font-heading font-semibold text-neutral mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </h3>
      
      <div className="space-y-4">
        {/* Skill Level Pills */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Skill Level
          </label>
          <div className="flex flex-wrap gap-2">
            {skillLevels.map((level) => {
              const isSelected = (level === 'All' && !selectedSkill) || selectedSkill === level;
              return (
                <button
                  key={level}
                  onClick={() => onSkillChange(level === 'All' ? '' : level)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    transform active:scale-95
                    ${isSelected
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                      : 'bg-dark-lighter text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-300'
                    }
                  `}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Filter by city..."
              className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-xl 
                       text-neutral placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                       transition-all duration-200"
            />
            {selectedCity && (
              <button
                onClick={() => onCityChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
