'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/app/actions/login';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await loginAction(formData);
      if (result && !result.success) {
        setError(result.error || 'Login failed');
        setLoading(false);
      }
      // If successful, redirect happens in the server action
    } catch (err) {
      // Redirect throws an error, which is expected
      if (err && typeof err === 'object' && 'digest' in err) {
        // This is a Next.js redirect, ignore it
        return;
      }
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="w-full max-w-md">
        <div className="bg-neutral rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2 text-center">
            Padel Connect
          </h1>
          <p className="text-gray-600 text-center mb-8">Welcome back! Please log in to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
                {error.includes('confirm') && email && (
                  <button
                    type="button"
                    onClick={async () => {
                      const supabase = createClient();
                      const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: email,
                        options: {
                          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
                        },
                      });
                      if (resendError) {
                        setError('Error: ' + resendError.message);
                      } else {
                        setError('');
                        alert('Confirmation email sent! Please check your inbox (and spam folder).');
                      }
                    }}
                    className="mt-2 text-sm text-blue-600 hover:underline block"
                  >
                    Resend confirmation email
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-secondary font-medium hover:underline">
              Sign up
            </Link>
          </p>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Forgot your password?{' '}
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  setError('Please enter your email address first');
                  return;
                }
                const supabase = createClient();
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : 'https://padel-connect-cyan.vercel.app/reset-password',
                });
                if (resetError) {
                  setError('Error: ' + resetError.message);
                } else {
                  setError('');
                  alert('Password reset email sent! Please check your inbox (and spam folder).');
                }
              }}
              className="text-primary font-medium hover:underline"
            >
              Reset password
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
