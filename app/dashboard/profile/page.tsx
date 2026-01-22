'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// Dynamically import Cropper to avoid SSR issues
const Cropper = dynamic(() => import('react-easy-crop').then((mod) => mod.default), {
  ssr: false,
});

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
  const [saving, setSaving] = useState(false);
  
  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        console.log('Name from profile:', profileData?.name);
        setProfile(profileData);
        setSkillLevel(profileData?.skill_level || 'Beginner');
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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Show crop modal instead of uploading immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
      
      // Reset file input
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to crop size
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    // Draw circular crop
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Calculate scale to fit image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw image centered and scaled
    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user) {
      return;
    }

    try {
      setSaving(true);
      
      // Create cropped image
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Get old photo URL before uploading new one
      const { data: oldProfile } = await supabase
        .from('players')
        .select('photo_url')
        .eq('user_id', user.id)
        .single();

      // Generate unique filename
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `profile-photos/${fileName}`;

      // Upload cropped image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImage, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          alert('Storage bucket not found. Please create an "avatars" bucket in Supabase Storage.');
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('denied')) {
          alert('Permission denied. Please check your Supabase Storage policies.');
        } else {
          alert(uploadError.message || 'Failed to upload image');
        }
        
        setShowCropModal(false);
        setImageToCrop(null);
        setSaving(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;

      // Update player profile with photo URL
      const { error: updateError } = await supabase
        .from('players')
        .update({ photo_url: photoUrl })
        .eq('user_id', user.id);

      if (updateError) {
        await supabase.storage.from('avatars').remove([filePath]);
        alert('Failed to update profile with photo URL');
        setShowCropModal(false);
        setImageToCrop(null);
        setSaving(false);
        return;
      }

      // Delete old photo if it exists and is different
      if (oldProfile?.photo_url && oldProfile.photo_url !== photoUrl) {
        try {
          const oldUrl = oldProfile.photo_url;
          const urlParts = oldUrl.split('/storage/v1/object/public/avatars/');
          if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (deleteError) {
          console.error('Error deleting old photo:', deleteError);
        }
      }

      // Refresh profile data
      const { data: profileData } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Close crop modal
      setShowCropModal(false);
      setImageToCrop(null);
      setSelectedImagePreview(null);
      setSaving(false);
    } catch (err) {
      console.error('Crop/Upload error:', err);
      alert('Failed to crop and upload photo');
      setShowCropModal(false);
      setImageToCrop(null);
      setSaving(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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

  const handleCancelEditSkillLevel = () => {
    setSkillLevel(profile?.skill_level || 'Beginner');
    setEditingSkillLevel(false);
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
                  {profile?.name || 'Not set'}
                </span>
                {!profile?.name && (
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
                <span className="text-gray-300 font-medium">Location</span>
              </div>
              <div>
                <span className="text-neutral font-semibold text-lg">
                  {profile?.location || 'Not set'}
                </span>
                {!profile?.location && (
                  <p className="text-sm text-gray-400 mt-1">
                    Location is set during signup and cannot be changed
                  </p>
                )}
              </div>
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

      {/* Crop Modal */}
      {isClient && showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-dark-light rounded-lg p-6 max-w-2xl w-full mx-4 border border-dark-lighter">
            <h3 className="text-xl font-heading font-bold text-neutral mb-4 text-center">
              Crop Your Profile Photo
            </h3>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Adjust the circle to focus on the part of the photo you want to show
            </p>
            
            <div className="relative w-full h-96 bg-dark rounded-lg overflow-hidden mb-4">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>

            {/* Zoom Control */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCropCancel}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-dark font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={saving}
                className="px-6 py-2 bg-secondary text-neutral font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

