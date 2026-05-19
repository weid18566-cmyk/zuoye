import { useAppState } from '@/hooks/useAppState';
import { SplashScreen } from '@/sections/SplashScreen';
import { StoryLibrary } from '@/sections/StoryLibrary';
import { ReadingPage } from '@/sections/ReadingPage';
import { SettingsPage } from '@/sections/SettingsPage';
import { CollectionPage } from '@/sections/CollectionPage';
import { BottomNav } from '@/sections/BottomNav';
import { stories } from '@/data/stories';
import './App.css';

function App() {
  const {
    theme,
    toggleTheme,
    currentPage,
    setCurrentPage,
    aiConfig,
    updateAIConfig,
    readingProgress,
    saveProgress,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    currentStoryId,
    currentViewMode,
    setCurrentViewMode,
    startReading,
    showTimeLimitModal,
    setShowTimeLimitModal,
    goHome,
  } = useAppState();

  // 处理从开屏进入
  const handleEnterFromSplash = () => {
    setCurrentPage('library');
  };

  // 处理选择故事
  const handleSelectStory = (storyId: string) => {
    startReading(storyId);
  };

  // 处理收藏切换
  const handleToggleFavorite = (storyId: string) => {
    if (isFavorite(storyId)) {
      removeFavorite(storyId);
    } else {
      addFavorite(storyId);
    }
  };

  // 处理阅读完成
  const handleReadingComplete = () => {
    if (currentStoryId) {
      saveProgress({
        storyId: currentStoryId,
        chapterId: stories.find(s => s.id === currentStoryId)?.chapters[0].id || '',
        characterId: currentViewMode,
        progress: 100,
        lastReadAt: Date.now(),
      });
    }
    setCurrentPage('library');
  };

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case 'splash':
        return <SplashScreen onEnter={handleEnterFromSplash} />;

      case 'library':
        return (
          <StoryLibrary
            onSelectStory={handleSelectStory}
            onOpenSettings={() => setCurrentPage('settings')}
            favorites={favorites.map(f => f.storyId)}
            onToggleFavorite={handleToggleFavorite}
          />
        );

      case 'reading':
        if (!currentStoryId) {
          setCurrentPage('library');
          return null;
        }
        return (
          <ReadingPage
            storyId={currentStoryId}
            viewMode={currentViewMode}
            onViewModeChange={setCurrentViewMode}
            onBack={goHome}
            onComplete={handleReadingComplete}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            aiConfig={aiConfig}
            onUpdateAIConfig={updateAIConfig}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBack={() => setCurrentPage('library')}
          />
        );

      case 'collection':
        return (
          <CollectionPage
            favorites={favorites}
            readingProgress={readingProgress}
            onSelectStory={handleSelectStory}
            onRemoveFavorite={removeFavorite}
            onBack={() => setCurrentPage('library')}
          />
        );

      default:
        return <SplashScreen onEnter={handleEnterFromSplash} />;
    }
  };

  return (
    <div className={`app ${theme}`}>
      {/* 主内容 */}
      <main className="min-h-screen">
        {renderPage()}
      </main>

      {/* 底部导航 - 只在特定页面显示 */}
      {currentPage !== 'splash' && currentPage !== 'reading' && currentPage !== 'settings' && (
        <BottomNav
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          favoriteCount={favorites.length}
        />
      )}

      {/* 防沉迷超时弹窗 */}
      {showTimeLimitModal && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-4xl text-orange-500">
                timer_off
              </span>
            </div>
            <h3 className="font-title text-kid-lg text-kid-text mb-2">
              休息一下吧
            </h3>
            <p className="text-kid-sm text-kid-text/60 mb-6">
              你已经阅读了 {aiConfig.maxSessionDuration} 分钟，该休息一下眼睛啦
            </p>
            <button
              onClick={() => {
                setShowTimeLimitModal(false);
                goHome();
              }}
              className="w-full btn-primary"
            >
              <span className="material-symbols-rounded">home</span>
              <span>返回主页</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
