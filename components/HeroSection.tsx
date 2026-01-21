'use client';

import { useRouter } from 'next/navigation';
import { toggleOnlineStatus } from '@/app/actions/matchmaking';

/**
 * Hero Section Component
 * 
 * Hero section with headline, subtext, and primary action button.
 * Connects to existing toggleOnlineStatus handler to go online.
 */
export default function HeroSection({ isOnline }: { isOnline: boolean }) {
  const router = useRouter();

  const handleWantToPlay = async () => {
    // If not online, go online first
    if (!isOnline) {
      const result = await toggleOnlineStatus(true);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to go online');
      }
    }
    // If already online, user can browse players below
  };

  return (
    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-8 mb-8 border border-primary/30">
      <h2 className="text-3xl font-heading font-bold text-neutral mb-3">
        Ready to play padel?
      </h2>
      <p className="text-gray-300 mb-6 text-lg">
        Find players near you in minutes
      </p>
      <button
        onClick={handleWantToPlay}
        className="bg-primary text-neutral font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition text-lg"
      >
        🎾 I WANT TO PLAY
      </button>
    </div>
  );
}

