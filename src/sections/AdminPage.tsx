import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, updateUser, deleteUser } from '@/lib/db';
import type { User, UserRole } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理员',
  parent: '家长',
  child: '孩子',
};

export function AdminPage() {
  const { user: currentUser, setCurrentPage } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const all = await getAllUsers();
    setUsers(all);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      setMessage('不能禁用自己的账号');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    const newStatus = targetUser.status === 'active' ? 'disabled' : 'active';
    await updateUser({ ...targetUser, status: newStatus });
    setMessage(`已${newStatus === 'active' ? '启用' : '禁用'}用户 ${targetUser.username}`);
    loadUsers();
    setTimeout(() => setMessage(''), 2000);
  };

  const handleChangeRole = async (targetUser: User, newRole: UserRole) => {
    if (targetUser.id === currentUser?.id) {
      setMessage('不能修改自己的角色');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    await updateUser({ ...targetUser, role: newRole });
    setMessage(`已将 ${targetUser.username} 的角色改为${ROLE_LABELS[newRole]}`);
    loadUsers();
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      setMessage('不能删除自己的账号');
      setConfirmDelete(null);
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    await deleteUser(userId);
    setMessage('用户已删除');
    setConfirmDelete(null);
    loadUsers();
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentPage('profile')} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <h1 className="font-title text-kid-lg text-kid-text">用户管理</h1>
        </div>
      </header>

      <main className="px-5 space-y-4">
        {/* 统计卡片 */}
        <section className="grid grid-cols-3 gap-3">
          {(['admin', 'parent', 'child'] as UserRole[]).map((role) => (
            <div key={role} className="bg-white rounded-kid-lg p-4 shadow-kid text-center">
              <p className="text-kid-xl font-title text-kid-primary">
                {users.filter((u) => u.role === role).length}
              </p>
              <p className="text-kid-xs text-kid-text/60 mt-1">{ROLE_LABELS[role]}</p>
            </div>
          ))}
        </section>

        {/* 用户列表 */}
        <section className="bg-white rounded-kid-lg shadow-kid overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading-spinner" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-rounded text-4xl text-kid-text/20">group_off</span>
              <p className="text-kid-sm text-kid-text/40 mt-2">暂无用户</p>
            </div>
          ) : (
            users.map((u, idx) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-5 py-4 ${
                  idx < users.length - 1 ? 'border-b border-kid-border' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-kid-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-kid-sm font-medium text-kid-text truncate">{u.username}</p>
                    {u.status === 'disabled' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-500 text-kid-xs">已禁用</span>
                    )}
                  </div>
                  <p className="text-kid-xs text-kid-text/50 truncate">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                  className="text-kid-xs rounded-kid-md border border-kid-border px-2 py-1.5 bg-white text-kid-text"
                >
                  <option value="admin">管理员</option>
                  <option value="parent">家长</option>
                  <option value="child">孩子</option>
                </select>
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`px-3 py-1.5 rounded-kid-md text-kid-xs font-medium transition-colors ${
                    u.status === 'active'
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-green-50 text-kid-primary hover:bg-green-100'
                  }`}
                >
                  {u.status === 'active' ? '禁用' : '启用'}
                </button>
                <button
                  onClick={() => setConfirmDelete(u.id)}
                  disabled={u.id === currentUser?.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    u.id === currentUser?.id
                      ? 'text-kid-text/10 cursor-not-allowed'
                      : 'text-kid-text/30 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg">delete</span>
                </button>
              </div>
            ))
          )}
        </section>

        {/* 说明 */}
        <div className="bg-white rounded-kid-lg p-5 shadow-kid">
          <h3 className="font-title text-kid-sm text-kid-text mb-3">权限说明</h3>
          <div className="space-y-2 text-kid-xs text-kid-text/60">
            <p><span className="text-red-500 font-medium">管理员：</span>可管理所有用户、数据导入导出、全局设置</p>
            <p><span className="text-kid-primary font-medium">家长：</span>可管理数据、全局设置（不可管理用户）</p>
            <p><span className="text-blue-500 font-medium">孩子：</span>仅可阅读故事和收藏（不可修改设置）</p>
          </div>
        </div>
      </main>

      {/* 删除确认 */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-3xl text-red-500">warning</span>
            </div>
            <h3 className="font-title text-kid-md text-kid-text mb-2">确认删除</h3>
            <p className="text-kid-xs text-kid-text/60 mb-6">
              删除后该用户的所有数据将被永久清除，且无法恢复
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary text-kid-sm">
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white rounded-kid-lg px-6 py-4 text-kid-sm font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-kid-primary text-white px-6 py-3 rounded-full shadow-kid-lg animate-fade-in-up flex items-center gap-2 z-50">
          <span className="material-symbols-rounded">{message.includes('删除') ? 'info' : 'check_circle'}</span>
          <span className="text-kid-sm">{message}</span>
        </div>
      )}
    </div>
  );
}
