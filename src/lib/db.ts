import type { User, UserCredential } from '@/types';
import {
  supabaseGet,
  supabasePost,
  supabasePatch,
  supabaseDelete,
  type SupabaseUser,
} from './supabase';

function toUser(row: SupabaseUser): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    role: row.role as User['role'],
    avatar: row.avatar,
    createdAt: row.created_at,
    status: row.status as User['status'],
    parentId: row.parent_id,
  };
}

function toSupabase(user: User, cred: UserCredential): Record<string, unknown> {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    parent_id: user.parentId,
    password_hash: cred.passwordHash,
    salt: cred.salt,
    created_at: user.createdAt,
  };
}

export async function createUser(user: User, credential: UserCredential): Promise<void> {
  await supabasePost('users', toSupabase(user, credential));
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await supabaseGet('users', { id: `eq.${id}` });
  return rows.length > 0 ? toUser(rows[0] as unknown as SupabaseUser) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const rows = await supabaseGet('users', { username: `eq.${username}` });
  return rows.length > 0 ? toUser(rows[0] as unknown as SupabaseUser) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await supabaseGet('users', { email: `eq.${email}` });
  return rows.length > 0 ? toUser(rows[0] as unknown as SupabaseUser) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const rows = await supabaseGet('users', { phone: `eq.${phone}` });
  return rows.length > 0 ? toUser(rows[0] as unknown as SupabaseUser) : null;
}

export async function getCredential(id: string): Promise<UserCredential | null> {
  const rows = await supabaseGet('users', { id: `eq.${id}` });
  if (rows.length === 0) return null;
  const u = rows[0] as unknown as SupabaseUser;
  return { id: u.id, passwordHash: u.password_hash, salt: u.salt };
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await supabaseGet('users');
  return rows.map(r => toUser(r as unknown as SupabaseUser));
}

export async function updateUser(user: User): Promise<void> {
  await supabasePatch('users', {
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    parent_id: user.parentId,
  }, { id: user.id });
}

export async function deleteUser(id: string): Promise<void> {
  await supabaseDelete('users', { id });
}

export async function updatePassword(id: string, newCredential: UserCredential): Promise<void> {
  await supabasePatch('users', {
    password_hash: newCredential.passwordHash,
    salt: newCredential.salt,
  }, { id });
}

export async function getAllUserData(): Promise<{ users: User[]; credentials: UserCredential[] }> {
  const rows = await supabaseGet('users');
  const users = rows.map(r => toUser(r as unknown as SupabaseUser));
  const credentials = rows.map(r => ({
    id: (r as unknown as SupabaseUser).id,
    passwordHash: (r as unknown as SupabaseUser).password_hash,
    salt: (r as unknown as SupabaseUser).salt,
  }));
  return { users, credentials };
}

export async function clearDatabase(): Promise<void> {
  const rows = await supabaseGet('users');
  for (const r of rows) {
    await supabaseDelete('users', { id: (r as unknown as SupabaseUser).id });
  }
}

export async function importUsers(users: User[], credentials: UserCredential[]): Promise<void> {
  await clearDatabase();
  for (let i = 0; i < users.length; i++) {
    await supabasePost('users', toSupabase(users[i], credentials[i]));
  }
}
