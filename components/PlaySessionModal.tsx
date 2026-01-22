'use client';

import { useState } from 'react';

/**
 * Play Session Modal Component
 * 
 * Modal/panel for starting a play session.
 * Collects: skill level, city, time window.
 */
export default function PlaySessionModal({
  isOpen,
  onClose,
  onStartSession,
  defaultCity,
  defaultSkillLevel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (data: {
    skillLevel: string;
    city: string;
    timeWindow: string;
  }) => void;
  defaultCity?: string;
  defaultSkillLevel?: string;
}) {
  const [skillLevel, setSkillLevel] = useState(defaultSkillLevel || '');
  const [city, setCity] = useState(defaultCity || '');
  const [timeWindow, setTimeWindow] = useState('now');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!skillLevel || !city) {
      alert('Please select your skill level and city');
      return;
    }
    onStartSession({ skillLevel, city, timeWindow });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card card-shadow p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-heading font-bold text-neutral">
            Start Looking for Players
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Skill Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Skill Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`
                    px-4 py-3 rounded-xl font-semibold transition-all duration-200
                    transform active:scale-95
                    ${skillLevel === level
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                      : 'bg-dark-lighter text-gray-400 border border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-xl 
                       text-neutral placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                       transition-all duration-200"
            />
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              When do you want to play?
            </label>
            <div className="space-y-2">
              {[
                { value: 'now', label: 'Now' },
                { value: 'today', label: 'Later today' },
                { value: 'week', label: 'This week' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeWindow(option.value)}
                  className={`
                    w-full px-4 py-3 rounded-xl font-semibold text-left transition-all duration-200
                    transform active:scale-95
                    ${timeWindow === option.value
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                      : 'bg-dark-lighter text-gray-400 border border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            className="btn-secondary w-full text-lg py-4"
          >
            Start Looking
          </button>
        </div>
      </div>
    </div>
  );
}










