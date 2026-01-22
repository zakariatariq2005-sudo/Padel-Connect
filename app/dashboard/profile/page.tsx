'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadProfilePhoto } from '@/app/actions/upload';
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
  const [editingSkillLevel, setEditingSkillLevel] = useState(false);
  const [skillLevel, setSkillLevel] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
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

        const { data: profileData, error: profileError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        
        if (profileError) {
          console.error('Error loading profile:', profileError);
        }
        
        console.log('Profile data loaded:', profileData);
        console.log('Nickname from profile:', profileData?.nickname);
        setProfile(profileData);
        setSkillLevel(profileData?.skill_level || 'Beginner');
        setLocation(profileData?.location || '');
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadProfilePhoto(formData);
        
        if (result.success) {
          // Refresh profile data
          const { data: profileData } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            setSelectedImagePreview(null); // Clear preview since we have the real URL
          }
        } else {
          alert(result.error || 'Failed to upload photo');
          setSelectedImagePreview(null);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Failed to upload photo');
        setSelectedImagePreview(null);
      }
    }
  };

  const displayImage = selectedImagePreview || profile?.photo_url;

  const handleSaveSkillLevel = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('players')
        .update({ skill_level: skillLevel })
        .eq('user_id', user.id);

      if (updateError) {
        alert('Failed to update skill level. Please try again.');
        setSaving(false);
        return;
      }

      setProfile({ ...profile, skill_level: skillLevel });
      setEditingSkillLevel(false);
      setSaving(false);
      // Don't refresh - just update local state
    } catch (err) {
      alert('An unexpected error occurred');
      setSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    try {
      const trimmedLocation = location.trim();
      if (!trimmedLocation) {
        alert('Location cannot be empty');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('players')
        .update({ location: trimmedLocation })
        .eq('user_id', user.id);

      if (updateError) {
        alert('Failed to update location. Please try again.');
        setSaving(false);
        return;
      }

      setProfile({ ...profile, location: trimmedLocation });
      setLocation(trimmedLocation);
      setEditingLocation(false);
      setSaving(false);
      // Don't refresh - just update local state
    } catch (err) {
      alert('An unexpected error occurred');
      setSaving(false);
    }
  };

  const handleCancelEditSkillLevel = () => {
    setSkillLevel(profile?.skill_level || 'Beginner');
    setEditingSkillLevel(false);
  };

  const handleCancelEditLocation = () => {
    setLocation(profile?.location || '');
    setEditingLocation(false);
  };

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
            <div className="py-3 border-b border-dark-lighter">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium">Name</span>
              </div>
              <div>
                <span className="text-neutral font-semibold text-lg">
                  {profile?.nickname || 'Not set'}
                </span>
                {!profile?.nickname && (
                  <p className="text-sm text-gray-400 mt-1">
                    Name is set during signup and cannot be changed
                  </p>
                )}
              </div>
            </div>
            
            <div className="py-3 border-b border-dark-lighter">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium">Skill Level</span>
                {!editingSkillLevel && (
                  <button
                    onClick={() => setEditingSkillLevel(true)}
                    className="text-primary text-sm hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingSkillLevel ? (
                <div className="space-y-2">
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSkillLevel}
                      disabled={saving}
                      className="px-4 py-2 bg-secondary text-neutral font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEditSkillLevel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-dark font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-neutral font-semibold">{profile?.skill_level || 'Not set'}</span>
              )}
            </div>
            
            <div className="py-3 border-b border-dark-lighter">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-medium">City</span>
                {!editingLocation && (
                  <button
                    onClick={() => setEditingLocation(true)}
                    className="text-primary text-sm hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingLocation ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-dark"
                    placeholder="Enter your city"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveLocation}
                      disabled={saving || !location.trim()}
                      className="px-4 py-2 bg-secondary text-neutral font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEditLocation}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 text-dark font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-neutral font-semibold">{profile?.location || 'Not set'}</span>
              )}
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

