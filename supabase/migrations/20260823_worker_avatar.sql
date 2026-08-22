-- Add avatar_url column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add avatar_url column to professionals table
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS avatar_url TEXT;
