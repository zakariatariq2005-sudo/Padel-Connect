'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * Signup Page Component
 * 
 * This page allows new users to create an account with email, password,
 * nickname, skill level, and location. After signup, a player profile is created
 * and the user is automatically logged in and redirected to the dashboard.
 * 
 * Nickname is the ONLY public identity - no full names are collected.
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    skillLevel: 'Beginner',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validateNickname = async (nickname: string): Promise<string | null> => {
    const trimmed = nickname.trim();
    
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
    // Note: This requires an RLS policy that allows unauthenticated users to check nickname availability
    const { data, error } = await supabase
      .from('players')
      .select('nickname')
      .eq('nickname', trimmed)
      .limit(1);
    
    if (error) {
      console.error('Nickname validation error:', error);
      // Don't block signup if validation fails - just show a warning
      // The database constraint will catch duplicates on insert
      return null; // Allow to proceed, database will validate on insert
    }
    
    if (data && data.length > 0) {
      return 'This nickname is already taken';
    }
    
    return null;
  };

  const handleNicknameChange = async (value: string) => {
    const trimmed = value.trim();
    setFormData({ ...formData, nickname: value });
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
    // If validation fails due to RLS/permissions, we'll validate on submit instead
    if (trimmed.length >= 3 && trimmed.length <= 20) {
      const error = await validateNickname(trimmed);
      if (error && error !== 'Error checking nickname availability') {
        // Only show error if it's not a permission/RLS error
        setNicknameError(error);
      }
      // If it's an RLS error, silently continue - validation will happen on submit
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNicknameError(null);
    setLoading(true);

    try {
      // Validate nickname
      const trimmedNickname = formData.nickname.trim();
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

      // Create the user account with email and password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account');
        setLoading(false);
        return;
      }

      // Create the player profile in our database
      const { error: profileError } = await supabase
        .from('players')
        .insert({
          user_id: authData.user.id,
          nickname: trimmedNickname,
          skill_level: formData.skillLevel,
          location: formData.location,
          is_online: true,
        });

      if (profileError) {
        // Check if it's a unique constraint violation for nickname
        if (profileError.code === '23505' || profileError.message.includes('unique')) {
          setNicknameError('This nickname is already taken');
        } else {
          setError('Account created but failed to create profile. Please try logging in.');
        }
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-neutral rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2 text-center">
            PadelConnect
          </h1>
          <p className="text-gray-600 text-center mb-8">Create your account to start playing</p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-dark mb-2">
                Nickname <span className="text-red-500">*</span>
              </label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark ${
                  nicknameError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Choose a unique nickname (3-20 chars)"
              />
              {nicknameError && (
                <p className="mt-1 text-sm text-red-600">{nicknameError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be your public display name. Must be unique.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="skillLevel" className="block text-sm font-medium text-dark mb-2">
                Skill Level
              </label>
              <select
                id="skillLevel"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-dark mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                placeholder="City, Country"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


