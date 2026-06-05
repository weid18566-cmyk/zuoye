import type { UserRole, Permission } from '@/types';

export function generateId(): string {
  return window.crypto.randomUUID();
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const salt = btoa(String.fromCharCode(...saltBytes));
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return { hash, salt };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + storedSalt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const computedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return computedHash === storedHash;
}

export function generateToken(): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  const randomPart = btoa(String.fromCharCode(...bytes));
  const nonce = Math.floor(Date.now() / 60000).toString(36);
  return `ks_${randomPart}_${nonce}`;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6 && password.length <= 32;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: { canRead: true, canLike: true, canManageSettings: true, canManageUsers: true, canManageData: true },
  parent: { canRead: true, canLike: true, canManageSettings: true, canManageUsers: false, canManageData: true },
  child: { canRead: true, canLike: true, canManageSettings: false, canManageUsers: false, canManageData: false },
};

export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

export function canAccess(role: UserRole, action: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][action];
}
