-- This SQL script creates the necessary tables for the Zen Academy LMS
-- Run this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  youtube_link TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'live')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to read their own profile and admins to read all profiles
CREATE POLICY users_select_policy ON public.users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow users to update only their own profile
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to insert new users
CREATE POLICY users_insert_policy ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow admins to delete users
CREATE POLICY users_delete_policy ON public.users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Modules table policies
-- Allow all authenticated users to read modules
CREATE POLICY modules_select_policy ON public.modules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow only admins to insert, update, delete modules
CREATE POLICY modules_insert_policy ON public.modules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY modules_update_policy ON public.modules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY modules_delete_policy ON public.modules
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Chapters table policies
-- Allow all authenticated users to read live chapters
CREATE POLICY chapters_select_policy ON public.chapters
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'live' OR 
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Allow only admins to insert, update, delete chapters
CREATE POLICY chapters_insert_policy ON public.chapters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY chapters_update_policy ON public.chapters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY chapters_delete_policy ON public.chapters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create some sample data (optional)

-- Insert sample modules
INSERT INTO public.modules (title) VALUES
  ('Core Technologies'),
  ('Advanced Concepts'),
  ('Practical Applications');

-- Get the module IDs
WITH module_ids AS (
  SELECT id FROM public.modules ORDER BY created_at
)
-- Insert sample chapters
INSERT INTO public.chapters (title, module_id, youtube_link, status)
SELECT
  'Introduction to Core Technologies',
  (SELECT id FROM public.modules WHERE title = 'Core Technologies'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'live'
UNION ALL
SELECT
  'Deep Dive into Core Technologies',
  (SELECT id FROM public.modules WHERE title = 'Core Technologies'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'live'
UNION ALL
SELECT
  'Advanced Concepts Overview',
  (SELECT id FROM public.modules WHERE title = 'Advanced Concepts'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'live'
UNION ALL
SELECT
  'Practical Applications Introduction',
  (SELECT id FROM public.modules WHERE title = 'Practical Applications'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'draft';