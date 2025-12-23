import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  Supabase SQL Schema - Run this in your Supabase SQL Editor:

  -- Users table (extends Supabase auth.users)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) DEFAULT NULL,
    verification_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
  );

  -- Messages table
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
  );

  -- Indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
  CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

  -- Enable Row Level Security
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

  -- RLS Policies for users table
  CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

  CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

  -- RLS Policies for messages table
  CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
      auth.uid() = sender_id OR auth.uid() = receiver_id
    );

  CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

  CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

  CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

  -- Enable Realtime for messages
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
*/
