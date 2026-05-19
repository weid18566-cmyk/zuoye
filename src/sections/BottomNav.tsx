import type { Page } from '@/types';

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  favoriteCount: number;
}

const navItems: { id: Page; label: string; icon: string; activeIcon: string }[] = [
  { id: 'library', label: '童话库', icon: 'menu_book', activeIcon: 'auto_stories' },
  { id: 'reading', label: '阅读中', icon: 'import_contacts', activeIcon: 'book' },
  { id: 'collection', label: '我的', icon: 'favorite_border', activeIcon: 'favorite' },
];

export function BottomNav({ currentPage, onPageChange, favoriteCount }: BottomNavProps) {
  // 阅读中页面只有在有当前故事时才显示
  const visibleItems = navItems.filter(item => {
    if (item.id === 'reading') return currentPage === 'reading';
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-kid-border safe-area-bottom z-50">
      <div className="flex items-center justify-around px-4 py-3">
        {visibleItems.map((item) => {
          const isActive = currentPage === item.id;
          const showBadge = item.id === 'collection' && favoriteCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`nav-item relative px-6 py-2 rounded-kid-md transition-all ${
                isActive ? 'active' : ''
              }`}
            >
              <span className={`material-symbols-rounded text-3xl transition-all ${
                isActive ? 'filled' : ''
              }`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="text-kid-xs font-medium">{item.label}</span>
              
              {/* 激活指示器 */}
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-kid-primary" />
              )}

              {/* 收藏数量徽章 */}
              {showBadge && (
                <span className="absolute -top-1 right-4 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-kid-xs flex items-center justify-center animate-pulse-soft">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
