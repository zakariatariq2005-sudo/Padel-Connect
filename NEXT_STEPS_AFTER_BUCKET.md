# Next Steps After Creating the Bucket

Great! You've created the `avatars` bucket. Now you need to set up the storage policies so users can upload photos.

## Step 1: Set Up Storage Policies

You have two options:

### Option A: Using SQL Editor (Recommended - Faster)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy and paste the entire contents of `STORAGE_POLICIES.sql`
4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned"

### Option B: Using Storage Dashboard

1. Go to **Storage** → Click on `avatars` bucket
2. Click the **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Copy and paste each policy from `STORAGE_POLICIES.sql` one at a time
6. Click **"Review"** then **"Save policy"**
7. Repeat for all 4 policies

## Step 2: Verify the Policies

1. Go to **Storage** → `avatars` bucket → **Policies** tab
2. You should see 4 policies:
   - ✅ Authenticated users can upload photos
   - ✅ Authenticated users can update photos
   - ✅ Authenticated users can delete photos
   - ✅ Public can view photos

## Step 3: Test It!

1. Go to your app's profile page
2. Try uploading a profile photo
3. It should work now! 🎉

## Troubleshooting

### Still getting errors?

- **"Permission denied"**: Make sure all 4 policies were created successfully
- **"Bucket not found"**: Refresh your browser and try again
- **Photo doesn't display**: Check that the `photo_url` column exists in your `players` table

### Need to check if photo_url column exists?

Run this in SQL Editor:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'photo_url';
```

If it doesn't exist, run:
```sql
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;
```

## That's it!

Once the policies are set up, profile photo uploads will work perfectly!

