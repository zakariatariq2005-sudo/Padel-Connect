/**
 * Loading state for dashboard
 * Shows while checking authentication
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

