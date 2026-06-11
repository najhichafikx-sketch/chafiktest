import { createSupabaseClient } from './supabase';

export function sbConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function setupSupabaseSchema() {
  if (!sbConfigured()) return false;

  const sql = `
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
  `;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    return true;
  } catch {
    return false;
  }
}

function sbFrom(table) {
  const sb = createSupabaseClient(true);
  if (!sb) return null;
  return sb.from(table);
}

export async function createUser(email, password, salt) {
  if (!sbConfigured()) return null;
  try {
    const { data, error } = await sbFrom('auth_users')
      .insert({ email, password, salt, credits: 5, plan: 'free' })
      .select('id, email, credits, plan, created_at')
      .single();
    if (error) {
      if (error.code === '23505') return null;
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function findUserByEmail(email) {
  if (!sbConfigured()) return null;
  try {
    const { data, error } = await sbFrom('auth_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function findUserById(id) {
  if (!sbConfigured()) return null;
  try {
    const { data, error } = await sbFrom('auth_users')
      .select('id, email, credits, plan, created_at')
      .eq('id', Number(id))
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateUserCredits(userId, delta) {
  if (!sbConfigured()) return false;
  try {
    const { data } = await sbFrom('auth_users')
      .select('credits')
      .eq('id', Number(userId))
      .maybeSingle();
    if (!data) return false;
    const newCredits = Math.max((data.credits || 0) - Math.abs(delta), 0);
    const { error } = await sbFrom('auth_users')
      .update({ credits: newCredits })
      .eq('id', Number(userId));
    return !error;
  } catch {
    return false;
  }
}

export async function setResetToken(email, token, expiresAt) {
  if (!sbConfigured()) return false;
  try {
    const { error } = await sbFrom('auth_users')
      .update({ reset_token: token, reset_token_expires: expiresAt.toISOString() })
      .eq('email', email);
    return !error;
  } catch {
    return false;
  }
}

export async function findUserByResetToken(token) {
  if (!sbConfigured()) return null;
  try {
    const { data, error } = await sbFrom('auth_users')
      .select('*')
      .eq('reset_token', token)
      .gte('reset_token_expires', new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updatePassword(userId, password, salt) {
  if (!sbConfigured()) return false;
  try {
    const { error } = await sbFrom('auth_users')
      .update({ password, salt, reset_token: '', reset_token_expires: null })
      .eq('id', Number(userId));
    return !error;
  } catch {
    return false;
  }
}

export async function getAllUsers() {
  if (!sbConfigured()) return null;
  try {
    const { data, error } = await sbFrom('auth_users')
      .select('id, email, credits, plan, created_at')
      .order('created_at', { ascending: false });
    if (error) return null;
    return data || [];
  } catch {
    return null;
  }
}
