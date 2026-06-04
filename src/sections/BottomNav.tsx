import { useState, useRef, useEffect } from 'react';
import type { Page, NavMenuItem } from '@/types';

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: Page) => void;
  favoriteCount: number;
  readingStoryId: string | null;
  canManageUsers?: boolean;
  canManageData?: boolean;
  canManageSettings?: boolean;
}

const mainItems: NavMenuItem[] = [
  { id: 'aiAssistant', label: 'AI精灵', icon: 'psychology', activeIcon: 'psychology_alt' },
  { id: 'library', label: '童话库', icon: 'menu_book', activeIcon: 'auto_stories' },
  { id: 'reading', label: '阅读中', icon: 'import_contacts', activeIcon: 'book' },
  { id: 'collection', label: '收藏', icon: 'favorite_border', activeIcon: 'favorite' },
  { id: 'profile', label: '我的', icon: 'person', activeIcon: 'person' },
];

const profileSubItems: NavMenuItem[] = [
  { id: 'profile', label: '个人中心', icon: 'person' },
  { id: 'globalSettings', label: '全局设置', icon: 'settings', permission: 'canManageSettings' },
  { id: 'dataManager', label: '数据管理', icon: 'database', permission: 'canManageData' },
  { id: 'admin', label: '用户管理', icon: 'admin_panel_settings', permission: 'canManageUsers' },
];

export function BottomNav({
  currentPage,
  onPageChange,
  favoriteCount,
  readingStoryId,
  canManageUsers,
  canManageData,
  canManageSettings,
}: BottomNavProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const permissionMap: Record<string, boolean | undefined> = {
    canManageSettings,
    canManageUsers,
    canManageData,
  };

  const filteredProfileItems = profileSubItems.filter(item =>
    !item.permission || permissionMap[item.permission]
  );

  const isProfileActive = ['profile', 'globalSettings', 'dataManager', 'admin'].includes(currentPage);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMoreMenu]);

  const getNavItems = () => {
    return mainItems.filter(item => {
      if (item.id === 'reading') return !!readingStoryId;
      return true;
    });
  };

  const visibleItems = getNavItems();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-kid-border safe-area-bottom z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {visibleItems.map((item) => {
            const isActive = item.id === 'profile'
              ? isProfileActive
              : currentPage === item.id;
            const showBadge = item.id === 'collection' && favoriteCount > 0;

            const handleClick = () => {
              if (item.id === 'profile') {
                setShowMoreMenu(prev => !prev);
              } else {
                onPageChange(item.id);
              }
            };

            return (
              <button
                key={item.id}
                onClick={handleClick}
              className={`nav-item relative px-4 py-1.5 rounded-kid-md transition-all touch-ripple ${
                isActive ? 'active' : ''
              }`}
              >
                <span className={`material-symbols-rounded text-2xl transition-all ${
                  isActive ? 'filled' : ''
                }`}>
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span className="text-kid-xs font-medium">{item.label}</span>

                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-kid-primary" />
                )}

                {showBadge && (
                  <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-kid-xs flex items-center justify-center" style={{ fontSize: '10px' }}>
                    {favoriteCount > 99 ? '99+' : favoriteCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {showMoreMenu && filteredProfileItems.length > 0 && (
        <div
          ref={menuRef}
          className="fixed bottom-20 right-4 z-[60] bg-white rounded-kid-xl shadow-kid-lg border border-kid-border py-2 min-w-[180px] animate-slide-in-up"
        >
          {filteredProfileItems.map((item, idx) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setShowMoreMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-kid-border/20 ${
                  isActive ? 'bg-kid-primary/5 text-kid-primary' : 'text-kid-text'
                } ${idx > 0 ? 'border-t border-kid-border/50' : ''}`}
              >
                <span className={`material-symbols-rounded text-xl ${isActive ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-kid-sm font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-kid-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {showMoreMenu && (
        <div className="fixed inset-0 z-[55]" onClick={() => setShowMoreMenu(false)} />
      )}
    </>
  );
}

export const PAGE_BREADCRUMBS: Record<string, { label: string; parent?: Page; icon?: string }> = {
  splash: { label: '开屏', icon: 'auto_awesome' },
  library: { label: '童话库', icon: 'menu_book' },
  reading: { label: '阅读中', parent: 'library', icon: 'import_contacts' },
  collection: { label: '我的收藏', parent: 'library', icon: 'favorite' },
  settings: { label: '设置', parent: 'library', icon: 'settings' },
  login: { label: '登录', icon: 'login' },
  register: { label: '注册', parent: 'login', icon: 'person_add' },
  forgotPassword: { label: '找回密码', parent: 'login', icon: 'lock_reset' },
  profile: { label: '个人中心', icon: 'person' },
  admin: { label: '用户管理', parent: 'profile', icon: 'admin_panel_settings' },
  dataManager: { label: '数据管理', parent: 'profile', icon: 'database' },
  globalSettings: { label: '全局设置', parent: 'profile', icon: 'settings' },
  aiAssistant: { label: 'AI助手', icon: 'psychology' },
};
