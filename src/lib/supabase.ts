import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ejmgqbtyzkrwtfpaqger.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wc7bJfw_KkQrBjjpxGKJFg_Yxf_li6J';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ Users API ============

export interface SupabaseUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  status: string;
  parent_id: string | null;
  password_hash: string;
  salt: string;
  created_at: number;
}

export async function supabaseGet(endpoint: string, query?: Record<string, string>): Promise<Record<string, unknown>[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  url.searchParams.set('select', '*');

  const res = await fetch(url.toString(), {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${endpoint}: ${res.status}`);
  return res.json();
}

export async function supabasePost(endpoint: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase POST ${endpoint}: ${res.status} ${err}`);
  }
}

export async function supabasePatch(endpoint: string, body: Record<string, unknown>, match: Record<string, string>): Promise<void> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  Object.entries(match).forEach(([k, v]) => url.searchParams.set(k, `eq.${v}`));

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase PATCH ${endpoint}: ${res.status} ${err}`);
  }
}

export async function supabaseDelete(endpoint: string, match: Record<string, string>): Promise<void> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  Object.entries(match).forEach(([k, v]) => url.searchParams.set(k, `eq.${v}`));

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase DELETE ${endpoint}: ${res.status}`);
}

// ============ SQL to create tables in Supabase SQL Editor ============
/*
Run this in Supabase Dashboard → SQL Editor:

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'child',
  avatar TEXT DEFAULT '👤',
  status TEXT DEFAULT 'active',
  parent_id UUID,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON users
  FOR ALL USING (true) WITH CHECK (true);
*/
