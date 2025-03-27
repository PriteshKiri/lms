-- This SQL script adds one admin user and one normal user to your Supabase database
-- Run this in the Supabase SQL Editor

-- First, we need to create the users in the auth.users table
-- Note: The passwords here are hashed versions of 'password123'
-- In a real application, you would use Supabase's auth.sign_up() function or the dashboard to create users

-- Create admin user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(), -- Generate a random UUID
  'admin@zenacademy.com',
  '$2a$10$Ot0Gu1Lc8aBdDQgTJ.rLvOXBR/ov9H.Q0PJ1Ut.xjQU9HloYY1ipe', -- Hashed version of 'password123'
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
) RETURNING id INTO admin_id;

-- Create normal user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(), -- Generate a random UUID
  'user@zenacademy.com',
  '$2a$10$Ot0Gu1Lc8aBdDQgTJ.rLvOXBR/ov9H.Q0PJ1Ut.xjQU9HloYY1ipe', -- Hashed version of 'password123'
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
) RETURNING id INTO user_id;

-- Now, add these users to our custom users table with their respective roles

-- Add admin user to users table
INSERT INTO public.users (id, name, email, role)
SELECT id, 'Admin User', email, 'admin'
FROM auth.users
WHERE email = 'admin@zenacademy.com';

-- Add normal user to users table
INSERT INTO public.users (id, name, email, role)
SELECT id, 'Normal User', email, 'user'
FROM auth.users
WHERE email = 'user@zenacademy.com';

-- Verify the users were created
SELECT * FROM public.users;