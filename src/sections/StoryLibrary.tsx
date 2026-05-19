import { useState, useMemo } from 'react';
import { stories, categories } from '@/data/stories';
import type { Story } from '@/types';

interface StoryLibraryProps {
  onSelectStory: (storyId: string) => void;
  onOpenSettings: () => void;
  favorites: string[];
  onToggleFavorite: (storyId: string) => void;
}

export function StoryLibrary({ 
  onSelectStory, 
  onOpenSettings, 
  favorites, 
  onToggleFavorite 
}: StoryLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesCategory = activeCategory === 'all' || story.category === activeCategory;
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      {/* 头部 */}
      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-title text-kid-lg text-kid-text">童话库</h1>
            <p className="text-kid-xs text-kid-text/60 mt-1">发现精彩故事</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setSearchQuery(prev => prev ? '' : ' ')}
              className="btn-icon"
            >
              <span className="material-symbols-rounded text-kid-primary">
                {searchQuery ? 'close' : 'search'}
              </span>
            </button>
            <button onClick={onOpenSettings} className="btn-icon">
              <span className="material-symbols-rounded text-kid-primary">settings</span>
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        {searchQuery !== '' && (
          <div className="animate-fade-in-up mb-4">
            <input
              type="text"
              placeholder="搜索故事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-kid w-full"
              autoFocus
            />
          </div>
        )}

        {/* 分类标签 */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            >
              <span className="material-symbols-rounded text-lg mr-1">
                {category.icon}
              </span>
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {/* 故事网格 */}
      <main className="px-5">
        <div className="grid grid-cols-2 gap-4">
          {filteredStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              isFavorite={favorites.includes(story.id)}
              onToggleFavorite={() => onToggleFavorite(story.id)}
              onClick={() => onSelectStory(story.id)}
            />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-kid-text/50">
            <span className="material-symbols-rounded text-6xl mb-4">search_off</span>
            <p className="text-kid-sm">没有找到相关故事</p>
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
}

function StoryCard({ story, index, isFavorite, onToggleFavorite, onClick }: StoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="story-card cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      {/* 封面 */}
      <div className="story-cover relative mb-3">
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
        
        {/* 收藏按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-kid transition-transform active:scale-90"
        >
          <span className={`material-symbols-rounded ${isFavorite ? 'filled text-red-500' : 'text-kid-text/40'}`}>
            favorite
          </span>
        </button>

        {/* 适龄标签 */}
        <div className="absolute bottom-2 left-2">
          <span className="age-badge">{story.ageRange}</span>
        </div>
      </div>

      {/* 信息 */}
      <h3 className="font-title text-kid-md text-kid-text mb-1 truncate">{story.title}</h3>
      <p className="text-kid-xs text-kid-text/60 line-clamp-2">{story.description}</p>
      
      {/* 分类标签 */}
      <div className="mt-2 flex items-center gap-1">
        <span className="material-symbols-rounded text-kid-primary text-sm">
          {story.category === 'grimm' ? 'forest' : story.category === 'andersen' ? 'waves' : 'temple'}
        </span>
        <span className="text-kid-xs text-kid-primary">{story.categoryName}</span>
      </div>
    </div>
  );
}
