import { redirect } from 'next/navigation';
import { requireAuth, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import OnlineToggle from '@/components/OnlineToggle';
import PlayerList from '@/components/PlayerList';
import DashboardAuthGuard from '@/components/DashboardAuthGuard';
import Link from 'next/link';

/**
 * Dashboard Page (Server Component)
 * 
 * This is the main page users see after logging in. It displays:
 * - A list of all online players
 * - Each player's name, skill level, and location
 * - A "Request Match" button for each player
 * 
 * Only authenticated users can access this page.
 */
export default async function DashboardPage() {
  // This will redirect to /login if not authenticated
  const user = await requireAuth();
  const profile = await getUserProfile();
  
  // Get all online players (excluding the current user)
  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from('players')
    .select('*')
    .eq('is_online', true)
    .neq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
  }

  return (
    <DashboardAuthGuard>
      <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-neutral border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">PadelConnect</h1>
              <p className="text-sm text-gray-600">Welcome, {profile?.name || 'Player'}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/requests"
                className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
              >
                Requests Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Online</span>
                <OnlineToggle initialStatus={profile?.is_online || false} />
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-heading font-bold text-neutral mb-2">
            Online Players
          </h2>
          <p className="text-gray-400">
            Find players to match with and start playing padel!
          </p>
        </div>

        {/* Player List */}
        {players && players.length > 0 ? (
          <PlayerList players={players} currentUserId={user.id} />
        ) : (
          <div className="bg-neutral rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No other players online at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon to find matches!</p>
          </div>
        )}

        {/* Quick Link to Requests */}
        <div className="mt-8 text-center">
          <Link
            href="/requests"
            className="inline-block bg-primary text-neutral font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          >
            View All Match Requests →
          </Link>
        </div>
      </main>
    </div>
  );
}


