'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error Boundary Component
 * 
 * This component catches errors in the app and displays a friendly error message.
 * It's required by Next.js App Router for error handling.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="max-w-md w-full bg-neutral rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-primary mb-4">
          Padel Connect
        </h1>
        <h2 className="text-2xl font-heading font-bold text-dark mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-neutral font-medium py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="bg-secondary text-neutral font-medium py-2 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}












