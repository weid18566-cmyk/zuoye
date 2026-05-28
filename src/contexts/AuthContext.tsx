import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole, Page } from '@/types';
import { safeJsonParse } from '@/lib/utils';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  getPermissions,
  generateId,
} from '@/lib/auth';
import {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByPhone,
  getCredential,
  updateUser,
  updatePassword,
} from '@/lib/db';

const SESSION_KEY = 'kidstory-session';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (account: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (
    username: string,
    email: string,
    phone: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    email: string,
    newPassword: string,
    verifyCode: string
  ) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  hasPermission: (action: 'canRead' | 'canLike' | 'canManageSettings' | 'canManageUsers' | 'canManageData') => boolean;
  setCurrentPage: (page: Page) => void;
  currentPage: Page;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [currentPage, setCurrentPage] = useState<Page>('splash');

  useEffect(() => {
    const session = safeJsonParse<{ userId?: string; token?: string }>(
      localStorage.getItem(SESSION_KEY),
      {}
    );

    if (session.userId && session.token) {
      getUserById(session.userId)
        .then((user) => {
          if (user) {
            setState({ user, token: session.token!, isAuthenticated: true, isLoading: false });
          } else {
            localStorage.removeItem(SESSION_KEY);
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        })
        .catch(() => {
          localStorage.removeItem(SESSION_KEY);
          setState((prev) => ({ ...prev, isLoading: false }));
        });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const saveSession = useCallback((user: User, token: string) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, token }));
  }, []);

  const login = useCallback(
    async (account: string, password: string) => {
      let user: User | null = null;

      user = await getUserByUsername(account);
      if (!user) user = await getUserByEmail(account);
      if (!user) user = await getUserByPhone(account);

      if (!user) {
        return { success: false, message: '账号不存在' };
      }

      if (user.status === 'disabled') {
        return { success: false, message: '账号已被禁用，请联系管理员' };
      }

      const credential = await getCredential(user.id);
      if (!credential) {
        return { success: false, message: '账号数据异常，请联系管理员' };
      }

      const isValid = await verifyPassword(password, credential.passwordHash, credential.salt);
      if (!isValid) {
        return { success: false, message: '密码错误' };
      }

      const token = generateToken();
      saveSession(user, token);
      setState({ user, token, isAuthenticated: true, isLoading: false });
      setCurrentPage('library');
      return { success: true, message: '登录成功' };
    },
    [saveSession, setCurrentPage]
  );

  const register = useCallback(
    async (username: string, email: string, phone: string, password: string, role: UserRole) => {
      if (!username.trim() || !email.trim() || !phone.trim() || !password) {
        return { success: false, message: '请填写完整信息' };
      }

      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        return { success: false, message: '用户名已存在' };
      }

      const existingEmail = await getUserByEmail(email);
      if (existingEmail) {
        return { success: false, message: '邮箱已被注册' };
      }

      const existingPhone = await getUserByPhone(phone);
      if (existingPhone) {
        return { success: false, message: '手机号已被注册' };
      }

      const id = generateId();
      const { hash, salt } = await hashPassword(password);

      const user: User = {
        id,
        username,
        email,
        phone,
        role,
        avatar: '👤',
        createdAt: Date.now(),
        status: 'active',
        parentId: null,
      };

      await createUser(user, { id, passwordHash: hash, salt });

      const token = generateToken();
      saveSession(user, token);
      setState({ user, token, isAuthenticated: true, isLoading: false });
      setCurrentPage('library');
      return { success: true, message: '注册成功' };
    },
    [saveSession, setCurrentPage]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    setCurrentPage('login');
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, message: '该邮箱未注册' };
    }
    localStorage.setItem('kidstory-reset-code', '123456');
    localStorage.setItem('kidstory-reset-email', email);
    return { success: true, message: '验证码已发送至您的邮箱（模拟：验证码为 123456）' };
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string, verifyCode: string) => {
    const savedCode = localStorage.getItem('kidstory-reset-code');
    const savedEmail = localStorage.getItem('kidstory-reset-email');

    if (savedCode !== verifyCode || savedEmail !== email) {
      return { success: false, message: '验证码错误' };
    }

    if (!validatePassword(newPassword)) {
      return { success: false, message: '密码长度应为6-32位' };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, message: '账号不存在' };
    }

    const { hash, salt } = await hashPassword(newPassword);
    await updatePassword(user.id, { id: user.id, passwordHash: hash, salt });

    localStorage.removeItem('kidstory-reset-code');
    localStorage.removeItem('kidstory-reset-email');

    return { success: true, message: '密码重置成功，请登录' };
  }, []);

  const updateUserProfile = useCallback(
    async (data: Partial<User>) => {
      if (!state.user) return { success: false, message: '未登录' };
      const updated = { ...state.user, ...data };
      await updateUser(updated);
      setState((prev) => ({ ...prev, user: updated }));
      return { success: true, message: '更新成功' };
    },
    [state.user]
  );

  const hasPermission = useCallback(
    (action: 'canRead' | 'canLike' | 'canManageSettings' | 'canManageUsers' | 'canManageData') => {
      if (!state.user) return false;
      const perms = getPermissions(state.user.role);
      return perms[action];
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateUserProfile,
        hasPermission,
        setCurrentPage,
        currentPage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
