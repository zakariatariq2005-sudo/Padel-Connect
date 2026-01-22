-- Add photo_url column to players table
-- Run this in Supabase SQL Editor

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

