-- Create user_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create a function to check if the user is an admin to avoid recursion in policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policies for admins
-- View all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (public.is_admin());

-- Insert profiles (usually done via Edge Function, but good to have)
CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Update profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (public.is_admin());

-- Delete profiles (soft delete usually via status update, but for completeness)
CREATE POLICY "Admins can delete profiles" ON profiles
    FOR DELETE
    USING (public.is_admin());
