'use client';

import { useEffect } from 'react';

/**
 * Global Error Boundary Component
 * 
 * This component catches errors in the root layout and displays a fallback UI.
 * It's required by Next.js App Router for global error handling.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
          <div className="max-w-md w-full bg-neutral rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-heading font-bold text-primary mb-4">
              Padel Connect
            </h1>
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={reset}
              className="bg-primary text-neutral font-medium py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}












