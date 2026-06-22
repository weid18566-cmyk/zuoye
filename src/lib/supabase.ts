import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// ============ Stories API ============

export interface SupabaseStory {
  id: string;
  title: string;
  content: string;
  theme: string;
  age_range: string;
  category: string;
  cover_image: string;
  author_id: string | null;
  is_published: boolean;
  created_at: number;
  updated_at: number;
}

export async function fetchStories(): Promise<SupabaseStory[]> {
  const rows = await supabaseGet('stories');
  return rows as SupabaseStory[];
}

export async function fetchStoryById(id: string): Promise<SupabaseStory | null> {
  const rows = await supabaseGet('stories', { id: `eq.${id}` });
  return rows.length > 0 ? (rows[0] as SupabaseStory) : null;
}

export async function createStory(story: Omit<SupabaseStory, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await supabasePost('stories', story as unknown as Record<string, unknown>);
}

// ============ Reading Progress API ============

export interface SupabaseReadingProgress {
  id: string;
  user_id: string;
  story_id: string | null;
  story_key: string | null;
  current_page: number;
  total_pages: number;
  completed: boolean;
  last_read_at: number;
}

export async function fetchProgress(userId: string): Promise<SupabaseReadingProgress[]> {
  const rows = await supabaseGet('reading_progress', { user_id: `eq.${userId}` });
  return rows as SupabaseReadingProgress[];
}

export async function upsertProgress(progress: Omit<SupabaseReadingProgress, 'id'>): Promise<void> {
  const existing = await supabaseGet('reading_progress', {
    user_id: `eq.${progress.user_id}`,
    story_id: progress.story_id ? `eq.${progress.story_id}` : 'is.null',
    story_key: progress.story_key ? `eq.${progress.story_key}` : 'is.null',
  });
  if (existing.length > 0) {
    await supabasePatch('reading_progress', progress as unknown as Record<string, unknown>, { id: (existing[0] as SupabaseReadingProgress).id });
  } else {
    await supabasePost('reading_progress', progress as unknown as Record<string, unknown>);
  }
}

// ============ Favorites API ============

export interface SupabaseFavorite {
  id: string;
  user_id: string;
  story_id: string | null;
  story_key: string | null;
  created_at: number;
}

export async function fetchFavorites(userId: string): Promise<SupabaseFavorite[]> {
  const rows = await supabaseGet('favorites', { user_id: `eq.${userId}` });
  return rows as SupabaseFavorite[];
}

export async function addFavorite(userId: string, storyId?: string, storyKey?: string): Promise<void> {
  await supabasePost('favorites', { user_id: userId, story_id: storyId || null, story_key: storyKey || null });
}

export async function removeFavorite(userId: string, storyId?: string, storyKey?: string): Promise<void> {
  if (storyId) {
    await supabaseDelete('favorites', { user_id: userId, story_id: storyId });
  } else if (storyKey) {
    await supabaseDelete('favorites', { user_id: userId, story_key: storyKey });
  }
}

// ============ Reading Stats API ============

export interface SupabaseReadingStats {
  id: string;
  user_id: string;
  total_stories_read: number;
  total_reading_time_sec: number;
  longest_streak_days: number;
  current_streak_days: number;
  last_read_date: string;
  achievements: string;
}

export async function fetchStats(userId: string): Promise<SupabaseReadingStats | null> {
  const rows = await supabaseGet('reading_stats', { user_id: `eq.${userId}` });
  return rows.length > 0 ? (rows[0] as SupabaseReadingStats) : null;
}

export async function upsertStats(stats: Omit<SupabaseReadingStats, 'id'>): Promise<void> {
  const existing = await supabaseGet('reading_stats', { user_id: `eq.${stats.user_id}` });
  if (existing.length > 0) {
    await supabasePatch('reading_stats', stats as unknown as Record<string, unknown>, { id: (existing[0] as SupabaseReadingStats).id });
  } else {
    await supabasePost('reading_stats', stats as unknown as Record<string, unknown>);
  }
}

// ============ Backups API ============

export async function createBackup(userId: string, data: unknown): Promise<void> {
  await supabasePost('backups', { user_id: userId, data });
}

export async function fetchBackups(userId: string): Promise<Array<{ id: string; data: unknown; created_at: number }>> {
  const rows = await supabaseGet('backups', { user_id: `eq.${userId}`, order: 'created_at.desc', limit: '10' });
  return rows as Array<{ id: string; data: unknown; created_at: number }>;
}
