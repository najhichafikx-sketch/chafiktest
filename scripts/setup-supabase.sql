-- Run this in your Supabase SQL Editor to set up the auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  credits INTEGER DEFAULT 5,
  plan TEXT DEFAULT 'free',
  reset_token TEXT DEFAULT '',
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_reset_token ON auth_users(reset_token);
