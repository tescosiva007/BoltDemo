/*
  # Demo Message Management System Database Schema

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `code` (text, unique store code)
      - `name` (text, store name)
      - `area` (text, geographic area)
      - `status` (text, active/inactive)
      - `postcode` (text, postal code)
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `title` (text, message subject)
      - `body` (text, message content)
      - `list_of_stores` (json, selected store codes/ids)
      - `user_id` (uuid, foreign key to auth.users)
      - `date_created` (timestamp)
    
    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `full_name` (text, user's full name)
      - `email` (text, user's email)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access
    - Ensure users can only access their own messages
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  area text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  postcode text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  list_of_stores json DEFAULT '[]'::json,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date_created timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Stores policies (public read access)
CREATE POLICY "Anyone can read stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

-- Messages policies (user-specific access)
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Insert sample stores data
INSERT INTO stores (code, name, area, status, postcode) VALUES
('ST001', 'Demo Store Downtown', 'Central Business District', 'active', '10001'),
('ST002', 'Demo Store Mall', 'Shopping Center', 'active', '10002'),
('ST003', 'Demo Store North', 'North District', 'active', '10003'),
('ST004', 'Demo Store South', 'South District', 'active', '10004'),
('ST005', 'Demo Store East', 'East District', 'active', '10005'),
('ST006', 'Demo Store West', 'West District', 'active', '10006'),
('ST007', 'Demo Store Suburbs', 'Suburban Area', 'active', '10007'),
('ST008', 'Demo Store Airport', 'Airport Terminal', 'active', '10008'),
('ST009', 'Demo Store University', 'University District', 'active', '10009'),
('ST010', 'Demo Store Harbor', 'Harbor District', 'active', '10010');