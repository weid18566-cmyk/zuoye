import { useState, useMemo, useCallback } from 'react';
import { stories, categories } from '@/data/stories';
import type { Story, LayoutMode, SortOrder, ViewScale } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  grimm: 'forest', andersen: 'waves', chinese: 'temple', myth: 'auto_awesome', fable: 'psychology', 'ai-branch': 'neurology',
};
function catIcon(c: string) { return CATEGORY_ICONS[c] || 'apps'; }

interface StoryLibraryProps {
  onSelectStory: (storyId: string) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  favorites: string[];
  onToggleFavorite: (storyId: string) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  viewScale: ViewScale;
  onViewScaleChange: (scale: ViewScale) => void;
}

const scaleMap: Record<ViewScale, { cols: string; gap: string; cardClass: string; imgClass: string }> = {
  small: { cols: 'grid-cols-3', gap: 'gap-2', cardClass: 'p-2', imgClass: 'h-28' },
  medium: { cols: 'grid-cols-2', gap: 'gap-4', cardClass: 'p-0', imgClass: 'h-40' },
  large: { cols: 'grid-cols-1', gap: 'gap-4', cardClass: 'p-0', imgClass: 'h-48' },
};

const sortOptions: { value: SortOrder; label: string; icon: string }[] = [
  { value: 'default', label: '默认排序', icon: 'sort' },
  { value: 'name-asc', label: '名称 A-Z', icon: 'sort_by_alpha' },
  { value: 'name-desc', label: '名称 Z-A', icon: 'text_rotation_none' },
  { value: 'age-asc', label: '年龄 低→高', icon: 'arrow_upward' },
  { value: 'age-desc', label: '年龄 高→低', icon: 'arrow_downward' },
  { value: 'recent', label: '最近更新', icon: 'update' },
];

function sortStories(list: Story[], order: SortOrder): Story[] {
  const sorted = [...list];
  switch (order) {
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'zh-CN'));
    case 'age-asc':
      return sorted.sort((a, b) => a.minAge - b.minAge);
    case 'age-desc':
      return sorted.sort((a, b) => b.minAge - a.minAge);
    case 'recent':
      return sorted;
    default:
      return sorted;
  }
}

export function StoryLibrary({
  onSelectStory,
  onOpenSettings,
  onOpenProfile,
  favorites,
  onToggleFavorite,
  layoutMode,
  onLayoutModeChange,
  sortOrder,
  onSortOrderChange,
  viewScale,
  onViewScaleChange,
}: StoryLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [filterAgeMin, setFilterAgeMin] = useState(0);
  const [filterAgeMax, setFilterAgeMax] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredStories = useMemo(() => {
    let result = stories.filter(story => {
      const matchesCategory = activeCategory === 'all' || story.category === activeCategory;
      const matchesSearch = !searchQuery.trim() ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.characters.some(c => c.name.includes(searchQuery));
      const matchesAge = story.minAge <= filterAgeMax && story.maxAge >= filterAgeMin;
      return matchesCategory && matchesSearch && matchesAge;
    });
    return sortStories(result, sortOrder);
  }, [activeCategory, searchQuery, sortOrder, filterAgeMin, filterAgeMax]);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleSearchClose();
    }
  }, [handleSearchClose]);

  const scale = scaleMap[viewScale];

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-title text-kid-lg text-kid-text">童话库</h1>
            <p className="text-kid-xs text-kid-text/60 mt-1">
              {filteredStories.length} 个故事
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSearchOpen(prev => !prev)}
              className={`btn-icon ${isSearchOpen ? 'bg-kid-primary/10' : ''}`}
            >
              <span className="material-symbols-rounded text-kid-primary">
                {isSearchOpen ? 'close' : 'search'}
              </span>
            </button>
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className={`btn-icon ${showFilters ? 'bg-kid-primary/10' : ''}`}
            >
              <span className="material-symbols-rounded text-kid-primary">tune</span>
            </button>
            <button onClick={onOpenSettings} className="btn-icon">
              <span className="material-symbols-rounded text-kid-primary">settings</span>
            </button>
            <button onClick={onOpenProfile} className="btn-icon">
              <span className="material-symbols-rounded text-kid-primary">account_circle</span>
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        {isSearchOpen && (
          <div className="animate-fade-in-up mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-kid-text/40">
                search
              </span>
              <input
                type="text"
                placeholder="搜索故事名称、描述、角色..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="input-kid w-full pl-11 pr-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kid-text/40 hover:text-kid-text"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-kid-xs text-kid-text/40 mt-2 px-1">
                搜索 "{searchQuery}" — 找到 {filteredStories.length} 个结果
              </p>
            )}
          </div>
        )}

        {/* 筛选面板 */}
        {showFilters && (
          <div className="animate-fade-in-up mb-4 bg-white rounded-kid-lg p-4 shadow-kid space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title text-kid-sm text-kid-text flex items-center gap-2">
                <span className="material-symbols-rounded text-kid-primary">filter_alt</span>
                筛选条件
              </h3>
              <button
                onClick={() => {
                  setFilterAgeMin(0);
                  setFilterAgeMax(10);
                  setActiveCategory('all');
                }}
                className="text-kid-xs text-kid-primary hover:underline"
              >
                重置
              </button>
            </div>

            <div>
              <p className="text-kid-xs text-kid-text/60 mb-2">适读年龄</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filterAgeMin}
                  onChange={(e) => setFilterAgeMin(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full bg-kid-border appearance-none cursor-pointer accent-kid-primary"
                />
                <span className="text-kid-xs text-kid-text/60 w-20 text-center">
                  {filterAgeMin} - {filterAgeMax} 岁
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filterAgeMax}
                  onChange={(e) => setFilterAgeMax(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full bg-kid-border appearance-none cursor-pointer accent-kid-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 分类标签 */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`category-tab whitespace-nowrap ${activeCategory === category.id ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded text-lg mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* 排序和视图工具栏 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-kid-border/50">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(prev => !prev)}
              className="flex items-center gap-1.5 text-kid-xs text-kid-text/60 hover:text-kid-primary transition-colors"
            >
              <span className="material-symbols-rounded text-base">
                {sortOptions.find(s => s.value === sortOrder)?.icon || 'sort'}
              </span>
              <span>{sortOptions.find(s => s.value === sortOrder)?.label || '排序'}</span>
              <span className="material-symbols-rounded text-sm">arrow_drop_down</span>
            </button>
            {showSortMenu && (
              <div
                className="absolute top-8 left-0 bg-white rounded-kid-lg shadow-kid-lg border border-kid-border py-2 min-w-[160px] z-50 animate-fade-in-up"
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortOrderChange(opt.value); setShowSortMenu(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-kid-xs transition-colors hover:bg-kid-border/20 ${
                      sortOrder === opt.value ? 'text-kid-primary font-medium bg-kid-primary/5' : 'text-kid-text'
                    }`}
                  >
                    <span className="material-symbols-rounded text-base">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-kid-border/30 rounded-kid-md p-1">
              {([
                { mode: 'grid' as LayoutMode, icon: 'grid_view' },
                { mode: 'list' as LayoutMode, icon: 'view_list' },
                { mode: 'compact' as LayoutMode, icon: 'view_compact' },
              ]).map((v) => (
                <button
                  key={v.mode}
                  onClick={() => onLayoutModeChange(v.mode)}
                  className={`w-8 h-8 rounded-kid-sm flex items-center justify-center transition-all ${
                    layoutMode === v.mode ? 'bg-white shadow-sm text-kid-primary' : 'text-kid-text/50'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg">{v.icon}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowViewMenu(prev => !prev)}
                className="w-8 h-8 rounded-kid-sm flex items-center justify-center text-kid-text/50 hover:text-kid-primary transition-colors"
              >
                <span className="material-symbols-rounded text-lg">zoom_in</span>
              </button>
              {showViewMenu && (
                <div className="absolute top-8 right-0 bg-white rounded-kid-lg shadow-kid-lg border border-kid-border py-2 min-w-[140px] z-50 animate-fade-in-up">
                  {([
                    { scale: 'small' as ViewScale, label: '小型', icon: 'photo_size_select_small' },
                    { scale: 'medium' as ViewScale, label: '中型', icon: 'photo_size_select_large' },
                    { scale: 'large' as ViewScale, label: '大型', icon: 'photo_size_select_actual' },
                  ]).map((s) => (
                    <button
                      key={s.scale}
                      onClick={() => { onViewScaleChange(s.scale); setShowViewMenu(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-kid-xs transition-colors hover:bg-kid-border/20 ${
                        viewScale === s.scale ? 'text-kid-primary font-medium bg-kid-primary/5' : 'text-kid-text'
                      }`}
                    >
                      <span className="material-symbols-rounded text-base">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 故事内容 */}
      <main className="px-5">
        {layoutMode === 'list' ? (
          <div className="space-y-3">
            {filteredStories.map((story, index) => (
              <StoryListItem
                key={story.id}
                story={story}
                index={index}
                isFavorite={favorites.includes(story.id)}
                onToggleFavorite={() => onToggleFavorite(story.id)}
                onClick={() => onSelectStory(story.id)}
                scale={viewScale}
              />
            ))}
          </div>
        ) : layoutMode === 'compact' ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredStories.map((story, index) => (
              <StoryCompactCard
                key={story.id}
                story={story}
                index={index}
                isFavorite={favorites.includes(story.id)}
                onToggleFavorite={() => onToggleFavorite(story.id)}
                onClick={() => onSelectStory(story.id)}
              />
            ))}
          </div>
        ) : (
          <div className={`grid ${scale.cols} ${scale.gap}`}>
            {filteredStories.map((story, index) => (
              <StoryCard
                key={story.id}
                story={story}
                index={index}
                isFavorite={favorites.includes(story.id)}
                onToggleFavorite={() => onToggleFavorite(story.id)}
                onClick={() => onSelectStory(story.id)}
                scale={viewScale}
              />
            ))}
          </div>
        )}

        {filteredStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-kid-text/50">
            <span className="material-symbols-rounded text-6xl mb-4">search_off</span>
            <p className="text-kid-md mb-2">没有找到相关故事</p>
            <p className="text-kid-sm text-kid-text/40">
              {searchQuery ? '试试其他关键词' : '试试调整筛选条件'}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setFilterAgeMin(0); setFilterAgeMax(10); }}
                className="mt-4 text-kid-sm text-kid-primary hover:underline"
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  scale: ViewScale;
}

function StoryCard({ story, index, isFavorite, onToggleFavorite, onClick, scale }: StoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgHeight = scale === 'large' ? 'h-48' : scale === 'medium' ? 'h-40' : 'h-28';

  return (
    <div
      className="story-card cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={onClick}
    >
      <div className={`story-cover relative mb-3 ${imgHeight}`}>
        <img
          src={story.cover}
          alt={story.title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-kid-border/50">
            <div className="loading-spinner" />
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-kid transition-transform active:scale-90"
        >
          <span className={`material-symbols-rounded ${isFavorite ? 'filled text-red-500' : 'text-kid-text/40'}`}>
            favorite
          </span>
        </button>

        <div className="absolute bottom-2 left-2">
          <span className="age-badge">{story.ageRange}</span>
        </div>
      </div>

      <h3 className="font-title text-kid-md text-kid-text mb-1 truncate">{story.title}</h3>
      {scale !== 'small' && (
        <p className="text-kid-xs text-kid-text/60 line-clamp-2">{story.description}</p>
      )}
      <div className="mt-2 flex items-center gap-1">
        <span className="material-symbols-rounded text-kid-primary text-sm">
          {catIcon(story.category)}
        </span>
        <span className="text-kid-xs text-kid-primary">{story.categoryName}</span>
      </div>
    </div>
  );
}

interface StoryListItemProps {
  story: Story;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  scale: ViewScale;
}

function StoryListItem({ story, index, isFavorite, onToggleFavorite, onClick, scale }: StoryListItemProps) {
  const imgSize = scale === 'large' ? 'w-28 h-28' : scale === 'medium' ? 'w-24 h-24' : 'w-20 h-20';

  return (
    <div
      className="bg-white rounded-kid-lg p-4 shadow-kid flex gap-4 cursor-pointer animate-fade-in-up hover:shadow-kid-lg transition-shadow"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
    >
      <div className={`${imgSize} rounded-kid-md overflow-hidden flex-shrink-0 relative`}>
        <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
        >
          <span className={`material-symbols-rounded text-sm ${isFavorite ? 'filled text-red-500' : 'text-kid-text/40'}`}>
            favorite
          </span>
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-title text-kid-md text-kid-text truncate">{story.title}</h3>
        <p className="text-kid-xs text-kid-text/60 mt-1 line-clamp-2">{story.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="age-badge">{story.ageRange}</span>
          <span className="text-kid-xs text-kid-primary flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">
              {catIcon(story.category)}
            </span>
            {story.categoryName}
          </span>
          <span className="text-kid-xs text-kid-text/40">{story.characters.length}个角色</span>
        </div>
      </div>

      <div className="flex items-center">
        <span className="material-symbols-rounded text-kid-text/30">chevron_right</span>
      </div>
    </div>
  );
}

interface StoryCompactCardProps {
  story: Story;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

function StoryCompactCard({ story, index, isFavorite, onToggleFavorite, onClick }: StoryCompactCardProps) {
  return (
    <div
      className="bg-white rounded-kid-lg overflow-hidden shadow-kid cursor-pointer animate-fade-in-up hover:shadow-kid-md transition-shadow"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="relative h-28">
        <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center"
        >
          <span className={`material-symbols-rounded text-xs ${isFavorite ? 'filled text-red-500' : 'text-kid-text/40'}`}>
            favorite
          </span>
        </button>
      </div>
      <div className="p-2">
        <h3 className="font-title text-kid-sm text-kid-text truncate">{story.title}</h3>
        <span className="text-kid-xs text-kid-text/60">{story.ageRange}</span>
      </div>
    </div>
  );
}
