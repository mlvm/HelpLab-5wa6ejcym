-- Add material_url column to trainings table
ALTER TABLE trainings ADD COLUMN IF NOT EXISTS material_url TEXT;

-- Add avatar_url column to professionals table (if needed, distinct from user profiles)
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS avatar_url TEXT;
