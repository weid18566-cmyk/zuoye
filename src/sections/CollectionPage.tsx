import { useState } from 'react';
import { stories } from '@/data/stories';
import type { ReadingProgress, Favorite } from '@/types';

interface CollectionPageProps {
  favorites: Favorite[];
  readingProgress: ReadingProgress[];
  onSelectStory: (storyId: string) => void;
  onRemoveFavorite: (storyId: string) => void;
  onBack: () => void;
}

export function CollectionPage({ 
  favorites, 
  readingProgress, 
  onSelectStory, 
  onRemoveFavorite,
  onBack 
}: CollectionPageProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const favoriteStories = favorites.map(fav => {
    const story = stories.find(s => s.id === fav.storyId);
    const progress = readingProgress.find(p => p.storyId === fav.storyId);
    return { story, progress, addedAt: fav.addedAt };
  }).filter(item => item.story);

  const handleDelete = (storyId: string) => {
    onRemoveFavorite(storyId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      {/* 头部 */}
      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <div>
            <h1 className="font-title text-kid-lg text-kid-text">我的收藏</h1>
            <p className="text-kid-xs text-kid-text/60 mt-1">
              共 {favoriteStories.length} 个故事
            </p>
          </div>
        </div>
      </header>

      {/* 收藏列表 */}
      <main className="px-5">
        {favoriteStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-kid-border/50 flex items-center justify-center mb-6">
              <span className="material-symbols-rounded text-5xl text-kid-text/30">
                favorite_border
              </span>
            </div>
            <p className="text-kid-md text-kid-text/50 mb-2">还没有收藏故事</p>
            <p className="text-kid-sm text-kid-text/40">去童话库发现精彩故事吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteStories.map(({ story, progress, addedAt }, index) => (
              <div
                key={story!.id}
                className="bg-white rounded-kid-lg p-4 shadow-kid animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex gap-4">
                  {/* 封面 */}
                  <div 
                    onClick={() => onSelectStory(story!.id)}
                    className="w-24 h-24 rounded-kid-md overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={story!.cover}
                      alt={story!.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div onClick={() => onSelectStory(story!.id)} className="cursor-pointer flex-1">
                        <h3 className="font-title text-kid-md text-kid-text truncate">
                          {story!.title}
                        </h3>
                        <p className="text-kid-xs text-kid-text/60 mt-1">
                          {story!.categoryName} · {story!.ageRange}
                        </p>
                      </div>
                      
                      {/* 删除按钮 */}
                      <button
                        onClick={() => setShowDeleteConfirm(story!.id)}
                        className="btn-icon w-10 h-10 ml-2"
                      >
                        <span className="material-symbols-rounded text-kid-text/40">
                          delete_outline
                        </span>
                      </button>
                    </div>

                    {/* 进度 */}
                    {progress && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-kid-xs text-kid-text/60 mb-1">
                          <span>阅读进度</span>
                          <span>{Math.round(progress.progress)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 继续阅读按钮 */}
                    <button
                      onClick={() => onSelectStory(story!.id)}
                      className="mt-3 text-kid-xs text-kid-primary flex items-center gap-1"
                    >
                      <span className="material-symbols-rounded text-sm">play_circle</span>
                      {progress ? '继续阅读' : '开始阅读'}
                    </button>
                  </div>
                </div>

                {/* 收藏时间 */}
                <div className="mt-3 pt-3 border-t border-kid-border/50 flex items-center gap-1 text-kid-xs text-kid-text/40">
                  <span className="material-symbols-rounded text-sm">schedule</span>
                  <span>收藏于 {new Date(addedAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div 
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-rounded text-3xl text-red-500">
                  delete_outline
                </span>
              </div>
              <h3 className="font-title text-kid-md text-kid-text mb-2">确定删除？</h3>
              <p className="text-kid-sm text-kid-text/60">
                删除后可以在童话库重新收藏
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-white rounded-kid-lg py-4 text-kid-sm font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
