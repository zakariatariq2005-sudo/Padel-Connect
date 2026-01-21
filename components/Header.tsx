'use client';

import OnlineToggle from './OnlineToggle';

/**
 * Header Component
 * 
 * Fixed header with app name, online status toggle, and status indicator.
 * Uses existing OnlineToggle component - does not reimplement toggle logic.
 */
export default function Header({ 
  isOnline, 
  userName 
}: { 
  isOnline: boolean;
  userName?: string;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-lighter/95 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Name - Left */}
          <div>
            <h1 className="text-xl font-heading font-bold text-primary">PadelConnect</h1>
          </div>

          {/* Online Status - Right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isOnline ? 'text-secondary' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <OnlineToggle initialStatus={isOnline} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

