'use client';

import OnlineToggle from './OnlineToggle';

/**
 * Header Component
 * 
 * Fixed header matching the exact design from the image:
 * - "PadelConnect" in teal on left
 * - "Offline"/"Online" button with toggle on right
 */
export default function Header({ 
  isOnline
}: { 
  isOnline: boolean;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-lighter/95 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Name - Left */}
          <div>
            <h1 className="text-xl font-heading font-bold">
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, #3B82F6, #14b8a6)'
                }}
              >
                Padel
              </span>
              <span style={{ color: '#14b8a6' }}>Connect</span>
            </h1>
          </div>

          {/* Online Status - Right */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-lighter transition">
              <span className={`text-sm font-medium ${isOnline ? 'text-secondary' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <OnlineToggle initialStatus={isOnline} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
