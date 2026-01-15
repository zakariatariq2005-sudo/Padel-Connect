'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Online Toggle Component
 * 
 * Allows users to toggle their online/offline status.
 * Updates the `is_online` field in the players table.
 * Premium design with smooth animations.
 */
export default function OnlineToggle({ initialStatus, onStatusChange }: { 
  initialStatus: boolean;
  onStatusChange?: () => void;
}) {
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsOnline(initialStatus);
  }, [initialStatus]);

  const handleToggle = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newStatus = !isOnline;
      
      const { error } = await supabase
        .from('players')
        .update({ is_online: newStatus })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating online status:', error);
        alert('Failed to update status');
      } else {
        setIsOnline(newStatus);
        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-300 transform active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isOnline 
          ? 'bg-gradient-to-r from-secondary to-green-400 text-white shadow-lg shadow-secondary/30' 
          : 'bg-dark-lighter text-gray-400 border border-white/10 hover:border-white/20'
        }
      `}
    >
      <span className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-500'}
      `} />
      {loading ? 'Updating...' : isOnline ? 'Online' : 'Offline'}
    </button>
  );
}
