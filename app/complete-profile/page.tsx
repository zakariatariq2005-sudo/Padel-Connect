'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Complete Profile Page
 * 
 * This page is shown to users who don't have a nickname set.
 * They must set a nickname before accessing the app.
 */
export default function CompleteProfilePage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('players')
          .select('nickname')
          .eq('user_id', user.id)
          .single();
        
        // If user already has a nickname, redirect to dashboard
        if (profile?.nickname) {
          router.push('/dashboard');
          return;
        }
        
        setChecking(false);
      } catch (err) {
        console.error('Error checking profile:', err);
        setChecking(false);
      }
    };

    checkProfile();
  }, [router, supabase]);

  const validateNickname = async (nicknameValue: string): Promise<string | null> => {
    const trimmed = nicknameValue.trim();
    
    if (!trimmed) {
      return 'Nickname is required';
    }
    
    if (trimmed.length < 3) {
      return 'Nickname must be at least 3 characters';
    }
    
    if (trimmed.length > 20) {
      return 'Nickname must be 20 characters or less';
    }
    
    // Check uniqueness
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'Not authenticated';
    
    const { data, error } = await supabase
      .from('players')
      .select('nickname, user_id')
      .eq('nickname', trimmed)
      .limit(1);
    
    if (error) {
      return 'Error checking nickname availability';
    }
    
    // Allow if it's the current user's nickname (for editing)
    if (data && data.length > 0 && data[0].user_id !== user.id) {
      return 'This nickname is already taken';
    }
    
    return null;
  };

  const handleNicknameChange = async (value: string) => {
    const trimmed = value.trim();
    setNickname(value);
    setNicknameError(null);
    
    if (trimmed.length > 0 && trimmed.length < 3) {
      setNicknameError('Nickname must be at least 3 characters');
      return;
    }
    
    if (trimmed.length > 20) {
      setNicknameError('Nickname must be 20 characters or less');
      return;
    }
    
    // Check uniqueness only if valid length
    if (trimmed.length >= 3 && trimmed.length <= 20) {
      const error = await validateNickname(trimmed);
      if (error) {
        setNicknameError(error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNicknameError(null);
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Validate nickname
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname) {
        setNicknameError('Nickname is required');
        setLoading(false);
        return;
      }
      
      if (trimmedNickname.length < 3 || trimmedNickname.length > 20) {
        setNicknameError('Nickname must be between 3 and 20 characters');
        setLoading(false);
        return;
      }
      
      const nicknameValidationError = await validateNickname(trimmedNickname);
      if (nicknameValidationError) {
        setNicknameError(nicknameValidationError);
        setLoading(false);
        return;
      }

      // Update player profile with nickname
      const { error: updateError } = await supabase
        .from('players')
        .update({ nickname: trimmedNickname })
        .eq('user_id', user.id);

      if (updateError) {
        // Check if it's a unique constraint violation for nickname
        if (updateError.code === '23505' || updateError.message.includes('unique')) {
          setNicknameError('This nickname is already taken');
        } else {
          setError('Failed to update profile. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Redirect to add profile photo step (optional, can skip)
      router.push('/add-profile-photo');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-neutral rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2 text-center">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Choose a nickname to get started. This will be your public display name.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-dark mb-2">
                Nickname <span className="text-red-500">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                autoFocus
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                  nicknameError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Choose a unique nickname (3-20 chars)"
              />
              {nicknameError && (
                <p className="mt-1 text-sm text-red-600">{nicknameError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be unique, 3-20 characters. This will be visible to other players.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!nicknameError || !nickname.trim()}
              className="w-full bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

