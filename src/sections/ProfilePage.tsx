import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveLocalBackup, restoreLocalBackup, hasLocalBackup } from '@/lib/backup';

export function ProfilePage() {
  const { user, logout, setCurrentPage, hasPermission, updateUserProfile } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');
  const [saveMsg, setSaveMsg] = useState('');

  const avatars = ['👤', '👧', '🧒', '👦', '👩', '👨', '🐱', '🐶', '🐰', '🐼'];

  const handleSaveProfile = async () => {
    const result = await updateUserProfile({ username, avatar });
    setSaveMsg(result.message);
    setEditMode(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleAutoBackup = () => {
    saveLocalBackup();
    setSaveMsg('手动存档成功');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleAutoRestore = () => {
    if (restoreLocalBackup()) {
      setSaveMsg('数据恢复成功');
    } else {
      setSaveMsg('没有可恢复的备份');
    }
    setTimeout(() => setSaveMsg(''), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('library')} className="btn-icon">
              <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
            </button>
            <h1 className="font-title text-kid-lg text-kid-text">个人中心</h1>
          </div>
          <button onClick={() => setEditMode(!editMode)} className="btn-icon">
            <span className="material-symbols-rounded text-kid-text/50">
              {editMode ? 'close' : 'edit'}
            </span>
          </button>
        </div>
      </header>

      <main className="px-5 space-y-5">
        {/* 用户信息卡片 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          {editMode ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">
                {avatars.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      avatar === a ? 'bg-kid-primary/20 ring-2 ring-kid-primary' : 'bg-kid-border/30'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-kid w-full"
                placeholder="用户名"
              />
              <button onClick={handleSaveProfile} className="w-full btn-primary">
                <span className="material-symbols-rounded">save</span>
                <span>保存</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-kid-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">{user.avatar}</span>
              </div>
              <h2 className="font-title text-kid-md text-kid-text">{user.username}</h2>
              <p className="text-kid-xs text-kid-text/60 mt-1">{user.email}</p>
              <span className={`inline-block mt-2 px-4 py-1 rounded-full text-kid-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-600' :
                user.role === 'parent' ? 'bg-kid-primary/10 text-kid-primary' :
                'bg-blue-100 text-blue-600'
              }`}>
                {user.role === 'admin' ? '管理员' : user.role === 'parent' ? '家长' : '孩子'}
              </span>
            </div>
          )}
        </section>

        {/* 功能菜单 */}
        <section className="bg-white rounded-kid-lg shadow-kid overflow-hidden">
          {/* 全局设置 */}
          <button
            onClick={() => setCurrentPage('globalSettings')}
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-kid-border/20 transition-colors border-b border-kid-border"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-purple-500">settings</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-kid-sm font-medium text-kid-text">全局设置</p>
              <p className="text-kid-xs text-kid-text/60">主题、字体、语言、快捷键</p>
            </div>
            <span className="material-symbols-rounded text-kid-text/30">chevron_right</span>
          </button>

          {/* 数据管理 */}
          {hasPermission('canManageData') && (
            <button
              onClick={() => setCurrentPage('dataManager')}
              className="w-full flex items-center gap-4 px-6 py-5 hover:bg-kid-border/20 transition-colors border-b border-kid-border"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-rounded text-blue-500">database</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-kid-sm font-medium text-kid-text">数据管理</p>
                <p className="text-kid-xs text-kid-text/60">导入导出、备份恢复</p>
              </div>
              <span className="material-symbols-rounded text-kid-text/30">chevron_right</span>
            </button>
          )}

          {/* 用户管理（仅管理员） */}
          {hasPermission('canManageUsers') && (
            <button
              onClick={() => setCurrentPage('admin')}
              className="w-full flex items-center gap-4 px-6 py-5 hover:bg-kid-border/20 transition-colors border-b border-kid-border"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-rounded text-red-500">admin_panel_settings</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-kid-sm font-medium text-kid-text">用户管理</p>
                <p className="text-kid-xs text-kid-text/60">多角色权限管理</p>
              </div>
              <span className="material-symbols-rounded text-kid-text/30">chevron_right</span>
            </button>
          )}

          {/* 手动存档 / 恢复 */}
          {hasPermission('canManageData') && (
            <>
              <button
                onClick={handleAutoBackup}
                className="w-full flex items-center gap-4 px-6 py-5 hover:bg-kid-border/20 transition-colors border-b border-kid-border"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-rounded text-green-500">save</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-kid-sm font-medium text-kid-text">手动存档</p>
                  <p className="text-kid-xs text-kid-text/60">保存当前所有数据</p>
                </div>
              </button>

              {hasLocalBackup() && (
                <button
                  onClick={handleAutoRestore}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-kid-border/20 transition-colors border-b border-kid-border"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="material-symbols-rounded text-orange-500">history</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-kid-sm font-medium text-kid-text">恢复存档</p>
                    <p className="text-kid-xs text-kid-text/60">从上次存档恢复数据</p>
                  </div>
                </button>
              )}
            </>
          )}

          {/* 退出登录 */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-red-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-red-500">logout</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-kid-sm font-medium text-red-500">退出登录</p>
            </div>
            <span className="material-symbols-rounded text-kid-text/30">chevron_right</span>
          </button>
        </section>

        <div className="text-center py-8">
          <p className="text-kid-xs text-kid-text/40">童梦AI童话剧场 v1.0</p>
          <p className="text-kid-xs text-kid-text/40 mt-1">专为3-8岁儿童设计</p>
        </div>
      </main>

      {/* 退出登录确认 */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-3xl text-red-500">logout</span>
            </div>
            <h3 className="font-title text-kid-md text-kid-text mb-2">确认退出</h3>
            <p className="text-kid-xs text-kid-text/60 mb-6">退出后需要重新登录</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-secondary text-kid-sm"
              >
                取消
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-red-500 text-white rounded-kid-lg px-6 py-4 text-kid-sm font-medium transition-all hover:bg-red-600"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示消息 */}
      {saveMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-kid-primary text-white px-6 py-3 rounded-full shadow-kid-lg animate-fade-in-up flex items-center gap-2 z-50">
          <span className="material-symbols-rounded">check_circle</span>
          <span className="text-kid-sm">{saveMsg}</span>
        </div>
      )}
    </div>
  );
}
