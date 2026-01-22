/**
 * Loading Component
 * 
 * This component is displayed while pages are loading.
 * It's required by Next.js App Router for loading states.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral text-lg font-heading">Loading...</p>
      </div>
    </div>
  );
}












