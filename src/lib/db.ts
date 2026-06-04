import type { User, UserCredential } from '@/types';

const DB_NAME = 'kidstory-auth';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = (event.target as IDBOpenDBRequest).transaction;

      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: true });
        store.createIndex('email', 'email', { unique: true });
        store.createIndex('phone', 'phone', { unique: false });
        store.createIndex('role', 'role', { unique: false });
      } else if (tx) {
        const store = tx.objectStore('users');
        if (!store.indexNames.contains('username')) {
          store.createIndex('username', 'username', { unique: true });
        }
        if (!store.indexNames.contains('email')) {
          store.createIndex('email', 'email', { unique: true });
        }
        if (!store.indexNames.contains('phone')) {
          store.createIndex('phone', 'phone', { unique: false });
        }
        if (!store.indexNames.contains('role')) {
          store.createIndex('role', 'role', { unique: false });
        }
      }

      if (!db.objectStoreNames.contains('credentials')) {
        db.createObjectStore('credentials', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      dbPromise = null;
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
  }
  return dbPromise;
}

async function getStore(mode: IDBTransactionMode, storeName: string): Promise<IDBObjectStore> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

async function wrapRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function createUser(
  user: User,
  credential: UserCredential
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['users', 'credentials'], 'readwrite');

  const userStore = tx.objectStore('users');
  const credStore = tx.objectStore('credentials');

  await wrapRequest(userStore.add(user));
  await wrapRequest(credStore.add(credential));

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

export async function getUserById(id: string): Promise<User | null> {
  const store = await getStore('readonly', 'users');
  return wrapRequest(store.get(id));
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const store = await getStore('readonly', 'users');
  const index = store.index('username');
  return wrapRequest(index.get(username));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const store = await getStore('readonly', 'users');
  const index = store.index('email');
  return wrapRequest(index.get(email));
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const store = await getStore('readonly', 'users');
  try {
    const index = store.index('phone');
    return wrapRequest(index.get(phone));
  } catch {
    const all = await wrapRequest(store.getAll());
    return all.find((u) => u.phone === phone) || null;
  }
}

export async function getCredential(id: string): Promise<UserCredential | null> {
  const store = await getStore('readonly', 'credentials');
  return wrapRequest(store.get(id));
}

export async function getAllUsers(): Promise<User[]> {
  const store = await getStore('readonly', 'users');
  return wrapRequest(store.getAll());
}

export async function updateUser(user: User): Promise<void> {
  const store = await getStore('readwrite', 'users');
  await wrapRequest(store.put(user));
}

export async function deleteUser(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['users', 'credentials'], 'readwrite');

  const userStore = tx.objectStore('users');
  const credStore = tx.objectStore('credentials');

  await wrapRequest(userStore.delete(id));
  await wrapRequest(credStore.delete(id));

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

export async function updatePassword(id: string, newCredential: UserCredential): Promise<void> {
  const store = await getStore('readwrite', 'credentials');
  await wrapRequest(store.put(newCredential));
}

export async function getAllUserData(): Promise<{ users: User[]; credentials: UserCredential[] }> {
  const db = await openDB();
  const tx = db.transaction(['users', 'credentials'], 'readonly');

  const users = await wrapRequest(tx.objectStore('users').getAll());
  const credentials = await wrapRequest(tx.objectStore('credentials').getAll());

  return { users, credentials };
}

export async function clearDatabase(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['users', 'credentials'], 'readwrite');
  await wrapRequest(tx.objectStore('users').clear());
  await wrapRequest(tx.objectStore('credentials').clear());
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

export async function importUsers(users: User[], credentials: UserCredential[]): Promise<void> {
  await clearDatabase();
  const db = await openDB();
  const tx = db.transaction(['users', 'credentials'], 'readwrite');

  for (const user of users) {
    await wrapRequest(tx.objectStore('users').add(user));
  }
  for (const cred of credentials) {
    await wrapRequest(tx.objectStore('credentials').add(cred));
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}
