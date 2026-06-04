import type { AIConfig, BackupData, User, UserCredential } from '@/types';
import { safeJsonParse } from '@/lib/utils';
import { getAllUserData, importUsers } from './db';
import { getDefaultAIConfig } from './ai-client';

const BACKUP_KEY = 'kidstory-backup';
const _defaultConfig = getDefaultAIConfig();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeAIConfig(value: unknown): AIConfig {
  if (!isRecord(value)) return { ..._defaultConfig };
  const def = _defaultConfig;
  return {
    model: typeof value.model === 'string' ? value.model : def.model,
    speechRate: typeof value.speechRate === 'number' ? value.speechRate : def.speechRate,
    contentFilter: typeof value.contentFilter === 'boolean' ? value.contentFilter : def.contentFilter,
    maxSessionDuration: typeof value.maxSessionDuration === 'number' ? value.maxSessionDuration : def.maxSessionDuration,
    provider: typeof value.provider === 'string' ? (value.provider as AIConfig['provider']) : def.provider,
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : def.apiKey,
    apiEndpoint: typeof value.apiEndpoint === 'string' ? value.apiEndpoint : def.apiEndpoint,
    temperature: typeof value.temperature === 'number' ? value.temperature : def.temperature,
    maxTokens: typeof value.maxTokens === 'number' ? value.maxTokens : def.maxTokens,
  };
}

export async function exportAllData(): Promise<Blob> {
  const { users, credentials } = await getAllUserData();

  const userData: BackupData['userData'] = {};

  for (const user of users) {
    const progressKey = `kidstory-${user.id}-progress`;
    const favoritesKey = `kidstory-${user.id}-favorites`;
    const configKey = `kidstory-${user.id}-config`;

    const readingProgressRaw = safeJsonParse<unknown>(localStorage.getItem(progressKey), []);
    const favoritesRaw = safeJsonParse<unknown>(localStorage.getItem(favoritesKey), []);
    const aiConfigRaw = safeJsonParse<unknown>(localStorage.getItem(configKey), {});

    userData[user.id] = {
      readingProgress: Array.isArray(readingProgressRaw) ? (readingProgressRaw as BackupData['userData'][string]['readingProgress']) : [],
      favorites: Array.isArray(favoritesRaw) ? (favoritesRaw as BackupData['userData'][string]['favorites']) : [],
      aiConfig: normalizeAIConfig(aiConfigRaw),
    };
  }

  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    users: users.map((u) => {
      const cred = credentials.find((c) => c.id === u.id);
      return {
        ...u,
        passwordHash: cred?.passwordHash,
        salt: cred?.salt,
      };
    }),
    userData,
  };

  const json = JSON.stringify(backup, null, 2);
  return new Blob([json], { type: 'application/json' });
}

export function downloadBackup(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `kidstory-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAllData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);

    if (!backup.version || !backup.users || !backup.userData) {
      return { success: false, message: '备份文件格式不正确' };
    }

    const users: User[] = backup.users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
      status: u.status,
      parentId: u.parentId,
    }));

    const credentials: UserCredential[] = backup.users
      .filter((u) => u.passwordHash && u.salt)
      .map((u) => ({
        id: u.id,
        passwordHash: u.passwordHash!,
        salt: u.salt!,
      }));

    await importUsers(users, credentials);

    for (const [userId, data] of Object.entries(backup.userData)) {
      if (data.readingProgress) {
        localStorage.setItem(`kidstory-${userId}-progress`, JSON.stringify(data.readingProgress));
      }
      if (data.favorites) {
        localStorage.setItem(`kidstory-${userId}-favorites`, JSON.stringify(data.favorites));
      }
      if (data.aiConfig) {
        localStorage.setItem(`kidstory-${userId}-config`, JSON.stringify(data.aiConfig));
      }
    }

    return { success: true, message: `成功导入 ${users.length} 个用户数据` };
  } catch {
    return { success: false, message: '文件解析失败，请检查文件格式' };
  }
}

export function saveLocalBackup(): void {
  const cached: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('kidstory-')) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        cached[key] = value;
      }
    }
  }

  localStorage.setItem(BACKUP_KEY, JSON.stringify(cached));
}

export function restoreLocalBackup(): boolean {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (!backup) return false;

  try {
    const cached: Record<string, string> = JSON.parse(backup);

    for (const [key, value] of Object.entries(cached)) {
      localStorage.setItem(key, value);
    }

    return true;
  } catch {
    return false;
  }
}

export function hasLocalBackup(): boolean {
  return localStorage.getItem(BACKUP_KEY) !== null;
}

export function clearLocalBackup(): void {
  localStorage.removeItem(BACKUP_KEY);
}
