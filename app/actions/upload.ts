'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Upload profile photo to Supabase Storage
 * 
 * @param file - File object from form data
 * @returns Success status and photo URL or error message
 */
export async function uploadProfilePhoto(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in upload:', authError);
      return { success: false, error: `Authentication error: ${authError.message}` };
    }
    
    if (!user) {
      console.error('No user found in upload');
      return { success: false, error: 'Not authenticated. Please log in again.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' };
    }

    // Get old photo URL before uploading new one
    const { data: oldProfile } = await supabase
      .from('players')
      .select('photo_url')
      .eq('user_id', user.id)
      .single();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message || 'Failed to upload image' };
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
      // If update fails, try to delete the uploaded file
      await supabase.storage.from('avatars').remove([filePath]);
      return { success: false, error: 'Failed to update profile with photo URL' };
    }

    // Delete old photo if it exists and is different
    if (oldProfile?.photo_url && oldProfile.photo_url !== photoUrl) {
      try {
        // Extract file path from old URL
        const oldUrl = oldProfile.photo_url;
        const urlParts = oldUrl.split('/storage/v1/object/public/avatars/');
        if (urlParts.length > 1) {
          const oldPath = urlParts[1];
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      } catch (deleteError) {
        // Log but don't fail - old photo cleanup is not critical
        console.error('Error deleting old photo:', deleteError);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');

    return { success: true, photoUrl };
  } catch (error) {
    console.error('Unexpected error in upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}
