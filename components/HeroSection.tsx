'use client';

import { useRouter } from 'next/navigation';
import { toggleOnlineStatus } from '@/app/actions/matchmaking';

/**
 * Hero Section Component - Card Design
 * 
 * Card with:
 * - "Ready to play padel?" heading
 * - "Find players near you in minutes" subtext
 * - "I WANT TO PLAY" button with tennis ball icon
 * - Redirects to matchmaking session (requests page) when clicked
 */
export default function HeroSection({ isOnline }: { isOnline: boolean }) {
  const router = useRouter();

  const handleWantToPlay = async () => {
    // If not online, go online first
    if (!isOnline) {
      const result = await toggleOnlineStatus(true);
      if (!result.success) {
        alert(result.error || 'Failed to go online');
        return;
      }
    }
    
    // Redirect to matchmaking session (requests page)
    router.push('/dashboard/requests');
  };

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark mb-3">
        Ready to play padel?
      </h2>
      <p className="text-gray-600 mb-6 text-lg">
        Find players near you in minutes
      </p>
      <button
        onClick={handleWantToPlay}
        className="bg-primary text-neutral font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition text-lg flex items-center gap-2"
      >
        <span className="text-2xl">🎾</span>
        <span>I WANT TO PLAY</span>
      </button>
    </div>
  );
}
