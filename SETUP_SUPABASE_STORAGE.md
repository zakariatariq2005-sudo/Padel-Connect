# Supabase Storage Setup for Profile Photos

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or specific types like `image/jpeg,image/png,image/webp`)

5. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

Go to **Storage** → **Policies** → Select the `avatars` bucket

### Policy 1: Allow authenticated users to upload their own photos

```sql
CREATE POLICY "Users can upload own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### Policy 2: Allow authenticated users to update their own photos

```sql
CREATE POLICY "Users can update own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### Policy 3: Allow authenticated users to delete their own photos

```sql
CREATE POLICY "Users can delete own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### Policy 4: Allow public read access (since bucket is public)

```sql
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 3: Add photo_url Column to Database

Run the SQL in `ADD_PHOTO_URL_COLUMN.sql` in your Supabase SQL Editor:

```sql
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;
```

## Step 4: Verify Setup

1. Try uploading a profile photo through the app
2. Check that the file appears in Storage → `avatars` bucket
3. Verify the `photo_url` is saved in the `players` table
4. Confirm the photo displays correctly in the profile page

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `avatars` (case-sensitive)
- Verify the bucket exists in Storage

### "Permission denied" error
- Check that the storage policies are created correctly
- Verify the user is authenticated
- Make sure the bucket is set to public (or policies allow access)

### Photo not displaying
- Check that `photo_url` is saved in the database
- Verify the URL is accessible (try opening it in a browser)
- Check browser console for CORS or loading errors


