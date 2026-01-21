'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toggleOnlineStatus } from '@/app/actions/matchmaking';
import { useRouter } from 'next/navigation';

/**
 * Online Toggle Component
 * 
 * Allows users to toggle their online/offline status.
 * Only online users can send and receive match requests.
 */
export default function OnlineToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Sync with real-time updates
  useEffect(() => {
    let mounted = true;

    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      const channel = supabase
        .channel(`online-status-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'players',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (mounted && payload.new.is_online !== undefined) {
              setIsOnline(payload.new.is_online as boolean);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupChannel();

    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [supabase]);

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = !isOnline;
    
    const result = await toggleOnlineStatus(newStatus);
    
    if (result.success) {
      setIsOnline(newStatus);
      router.refresh();
    } else {
      alert(result.error || 'Failed to update online status');
    }
    
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isOnline 
          ? 'bg-secondary' 
          : 'bg-gray-300'
        }
      `}
      aria-label={isOnline ? 'Go offline' : 'Go online'}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isOnline ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
      <span className="sr-only">{isOnline ? 'Online' : 'Offline'}</span>
    </button>
  );
}
