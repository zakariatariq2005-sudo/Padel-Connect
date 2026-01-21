'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

/**
 * Profile Page
 * 
 * Simple profile display with user info and logout.
 * Uses existing LogoutButton component - does not reimplement logout logic.
 */
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        const { data: profileData } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        setProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/login');
      }
    };

    loadProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleAvatarClick = () => {
    const fileInput = document.getElementById('profile-photo-input') as HTMLInputElement;
    fileInput?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Implement upload logic here
      // - Upload file to storage (Supabase Storage or similar)
      // - Get public URL
      // - Update profile.photo_url in database
      // - Refresh profile data
    }
  };

  const displayImage = selectedImagePreview || profile?.photo_url;

  return (
    <div className="min-h-screen bg-dark pb-20 md:pb-0">
      <Header isOnline={profile?.is_online || false} />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="bg-dark-light rounded-lg shadow-lg p-8 max-w-2xl mx-auto border border-dark-lighter">
          {/* Profile Photo */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dark-lighter hover:border-primary transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-light"
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-dark-lighter flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </button>
            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <h2 className="text-2xl font-heading font-bold text-neutral mb-6 text-center">
            Your Profile
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-dark-lighter">
              <span className="text-gray-300 font-medium">Name</span>
              <span className="text-neutral font-semibold">{profile?.name || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-dark-lighter">
              <span className="text-gray-300 font-medium">Skill Level</span>
              <span className="text-neutral font-semibold">{profile?.skill_level || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-dark-lighter">
              <span className="text-gray-300 font-medium">City</span>
              <span className="text-neutral font-semibold">{profile?.location || 'Not set'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-300 font-medium">Email</span>
              <span className="text-neutral font-semibold">{user.email}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-lighter text-center">
            <LogoutButton />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

