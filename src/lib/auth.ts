import type { UserRole, Permission } from '@/types';

function generateUUID(): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes].map((b, i) => {
    const hex = b.toString(16).padStart(2, '0');
    return (i === 4 || i === 6 || i === 8 || i === 10) ? `-${hex}` : hex;
  }).join('');
}

export function generateId(): string {
  return generateUUID();
}

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.byteLength; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const salt = uint8ArrayToBase64(saltBytes);
  const combined = password + salt;

  const hashBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    stringToUint8Array(combined)
  );

  const hash = uint8ArrayToBase64(new Uint8Array(hashBuffer));
  return { hash, salt };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const combined = password + storedSalt;

  const hashBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    stringToUint8Array(combined)
  );

  const computedHash = uint8ArrayToBase64(new Uint8Array(hashBuffer));
  return computedHash === storedHash;
}

export function generateToken(): string {
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
  const randomPart = uint8ArrayToBase64(randomBytes);
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
  admin: {
    canRead: true,
    canLike: true,
    canManageSettings: true,
    canManageUsers: true,
    canManageData: true,
  },
  parent: {
    canRead: true,
    canLike: true,
    canManageSettings: true,
    canManageUsers: false,
    canManageData: true,
  },
  child: {
    canRead: true,
    canLike: true,
    canManageSettings: false,
    canManageUsers: false,
    canManageData: false,
  },
};

export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

export function canAccess(role: UserRole, action: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][action];
}
