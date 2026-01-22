'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadProfilePhoto } from '@/app/actions/upload';

/**
 * Add Profile Photo Page
 * 
 * Shows after signup/complete-profile to allow users to upload a profile photo.
 * Users can skip this step - it's optional.
 */
export default function AddProfilePhotoPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        setUser(authUser);

        // Check if profile exists and has nickname
        const { data: profileData } = await supabase
          .from('players')
          .select('nickname, photo_url')
          .eq('user_id', authUser.id)
          .single();

        if (!profileData) {
          router.push('/complete-profile');
          return;
        }

        if (!profileData.nickname) {
          router.push('/complete-profile');
          return;
        }

        setProfile(profileData);
        
        // If user already has a photo, they can skip
        if (profileData.photo_url) {
          // Still show the page but allow them to change it
        }
        
        setChecking(false);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await uploadProfilePhoto(formData);

      if (result.success) {
        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Failed to upload photo');
        setUploading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setUploading(false);
    }
  };

  const handleSkip = () => {
    // Redirect to dashboard - photo is optional
    router.push('/dashboard');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const displayImage = preview || profile?.photo_url;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-neutral rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2 text-center">
            Add Profile Photo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Upload a photo to personalize your profile (optional)
          </p>

          <div className="space-y-6">
            {/* Photo Preview/Upload Area */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="photo-upload"
                className="cursor-pointer relative group"
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary group-hover:border-secondary transition-colors"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-dark-lighter flex items-center justify-center border-4 border-dark-lighter group-hover:border-primary transition-colors">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">
                    {displayImage ? 'Change Photo' : 'Choose Photo'}
                  </span>
                </div>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {selectedFile.name}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-secondary text-neutral font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
              <button
                onClick={handleSkip}
                disabled={uploading}
                className="w-full bg-gray-200 text-dark font-medium py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profile?.photo_url ? 'Keep Current Photo' : 'Skip for Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

