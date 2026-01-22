# Setup Storage Bucket for Profile Photos - Quick Guide

## Problem
You're getting "bucket not found" error because the `avatars` storage bucket doesn't exist yet.

## Solution: Create the Bucket (2 minutes)

### Step 1: Create the Bucket

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click **"Storage"** in the left sidebar
4. Click **"New bucket"** button
5. Fill in the form:
   - **Name**: `avatars` (must be exactly this, case-sensitive)
   - **Public bucket**: ✅ **Check this box** (important!)
   - **File size limit**: `5242880` (5 MB in bytes) or leave empty
   - **Allowed MIME types**: Leave empty (allows all image types)
6. Click **"Create bucket"**

### Step 2: Set Up Storage Policies (Simple Version)

After creating the bucket, you need to set permissions. Go to **Storage** → **Policies** → Click on the `avatars` bucket.

**Option A: Use Supabase Dashboard (Easiest)**
1. In the `avatars` bucket, click **"Policies"** tab
2. Click **"New Policy"**
3. Select **"For full customization"**
4. Copy and paste this policy:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their photos
CREATE POLICY "Authenticated users can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete their photos
CREATE POLICY "Authenticated users can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow everyone to view photos (public read)
CREATE POLICY "Public can view photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

5. Click **"Review"** then **"Save policy"**

**Option B: Use SQL Editor**
1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Paste the SQL above
4. Click **"Run"**

### Step 3: Verify the Bucket Exists

1. Go back to **Storage** → You should see `avatars` in the list
2. Click on it to verify it's there
3. Make sure it shows as **"Public"**

### Step 4: Test Upload

1. Go to your app's profile page
2. Try uploading a photo
3. It should work now!

## Troubleshooting

### Still getting "bucket not found"?
- Double-check the bucket name is exactly `avatars` (lowercase, no spaces)
- Make sure you're in the correct Supabase project
- Refresh your browser and try again

### Getting "Permission denied"?
- Make sure the bucket is set to **Public**
- Verify the storage policies were created (check Storage → Policies)
- Make sure you're logged in to your app

### Photo uploads but doesn't display?
- Check that the `photo_url` column exists in your `players` table
- Run this SQL if needed:
  ```sql
  ALTER TABLE players 
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
  ```

## That's it!

Once the bucket is created and policies are set, profile photo uploads will work automatically.

