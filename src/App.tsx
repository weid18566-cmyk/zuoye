import { useEffect, Suspense, lazy } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { GuideOverlay } from '@/components/ui/tooltip-guide';
import { PageTransition } from '@/components/ui/page-transition';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useReadingStats, ACHIEVEMENTS } from '@/hooks/useReadingStats';
import { SplashScreen } from '@/sections/SplashScreen';
import { StoryLibrary } from '@/sections/StoryLibrary';
import { ReadingPage } from '@/sections/ReadingPage';
import { SettingsPage } from '@/sections/SettingsPage';
import { CollectionPage } from '@/sections/CollectionPage';
import { LoginPage } from '@/sections/LoginPage';
import { RegisterPage } from '@/sections/RegisterPage';
import { ForgotPasswordPage } from '@/sections/ForgotPasswordPage';
import { ProfilePage } from '@/sections/ProfilePage';
import { BottomNav, PAGE_BREADCRUMBS } from '@/sections/BottomNav';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { AIAssistantPage } from '@/sections/AIAssistantPage';
import { stories } from '@/data/stories';
import type { Page } from '@/types';
import './App.css';

const AdminPage = lazy(() => import('@/sections/AdminPage').then(m => ({ default: m.AdminPage })));
const DataManagerPage = lazy(() => import('@/sections/DataManagerPage').then(m => ({ default: m.DataManagerPage })));
const GlobalSettingsPage = lazy(() => import('@/sections/GlobalSettingsPage').then(m => ({ default: m.GlobalSettingsPage })));

function Breadcrumb({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: Page) => void }) {
  const info = PAGE_BREADCRUMBS[currentPage];
  if (!info) return null;
  if (['splash', 'login', 'register', 'library'].includes(currentPage)) return null;

  const parent = info.parent ? PAGE_BREADCRUMBS[info.parent] : null;

  return (
    <div className="px-5 -mt-2 pb-3 relative z-10">
      <div className="flex items-center gap-1.5 text-kid-xs text-kid-text/40">
        <button onClick={() => onNavigate('library')} className="hover:text-kid-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-rounded text-sm">home</span>
          <span>首页</span>
        </button>
        {parent && (
          <>
            <span className="material-symbols-rounded text-xs">chevron_right</span>
            <button
              onClick={() => info.parent && onNavigate(info.parent)}
              className="hover:text-kid-primary transition-colors"
            >
              {parent.label}
            </button>
          </>
        )}
        <span className="material-symbols-rounded text-xs">chevron_right</span>
        <span className="text-kid-text/60">{info.label}</span>
      </div>
    </div>
  );
}

function AppContent() {
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
    recentStories,
    setRecentStories,
    pageHistory,
    goBack,
    currentStoryId,
    currentViewMode,
    setCurrentViewMode,
    startReading,
    showTimeLimitModal,
    setShowTimeLimitModal,
    goHome,
    layoutMode,
    setLayoutMode,
    sortOrder,
    setSortOrder,
    viewScale,
    setViewScale,
  } = useAppState();

  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { recordChapterRead, recordStoryComplete, unlockAchievements, newAchievements } = useReadingStats();
  const {
    showOnboarding,
    currentStep,
    steps,
    nextStep,
    prevStep,
    completeOnboarding,
  } = useOnboarding();

  const page = isLoading ? 'splash' : currentPage;

  const handleSetPage = (next: Page) => {
    setCurrentPage(next);
  };

  useEffect(() => {
    if (isLoading) return;
    const authPages: Page[] = ['login', 'register', 'forgotPassword', 'splash'];
    const isAuthPage = authPages.includes(currentPage);
    if (!isAuthenticated && !isAuthPage) {
      setCurrentPage('login');
      return;
    }
    if (isAuthenticated && isAuthPage && currentPage !== 'splash') {
      setCurrentPage('library');
    }
  }, [isAuthenticated, isLoading, currentPage, setCurrentPage]);

  // 成就解锁通知
  useEffect(() => {
    for (const ach of newAchievements) {
      const detail = ACHIEVEMENTS.find(a => a.id === String(ach));
      if (detail) {
        addToast(`🏆 解锁成就：${detail.title}`, 'success', 4000);
      }
    }
  }, [newAchievements]);

  const handleEnterFromSplash = () => {
    handleSetPage(isAuthenticated ? 'library' : 'login');
  };

  const handleSelectStory = (storyId: string) => {
    startReading(storyId);
  };

  const handleToggleFavorite = (storyId: string) => {
    if (isFavorite(storyId)) {
      removeFavorite(storyId);
      addToast('已取消收藏', 'info');
    } else {
      addFavorite(storyId);
      addToast('已添加到收藏', 'success');
    }
  };

  const handleReadingComplete = () => {
    if (currentStoryId) {
      const story = stories.find(s => s.id === currentStoryId);
      const lastChapterId = story?.chapters?.[story.chapters.length - 1]?.id || '';
      saveProgress({
        storyId: currentStoryId,
        chapterId: lastChapterId,
        characterId: currentViewMode,
        progress: 100,
        lastReadAt: Date.now(),
      });
      recordStoryComplete(story?.category);
      unlockAchievements();
    }
    handleSetPage('library');
    addToast('阅读完成！下次可以从收藏中继续', 'success');
  };

  const handleReadingProgress = (chapterId: string, progress: number) => {
    if (!currentStoryId) return;
    saveProgress({
      storyId: currentStoryId,
      chapterId,
      characterId: currentViewMode,
      progress,
      lastReadAt: Date.now(),
    });
    recordChapterRead(1);
    unlockAchievements();
  };

  // 修复：用 useEffect 处理 reading 页面无 storyId 的导航
  useEffect(() => {
    if (page === 'reading' && !currentStoryId) {
      setCurrentPage('library');
    }
  }, [page, currentStoryId, setCurrentPage]);

  const renderPage = () => {
    switch (page) {
      case 'splash':
        return <SplashScreen onEnter={handleEnterFromSplash} />;

      case 'login':
        return <LoginPage />;

      case 'register':
        return <RegisterPage />;

      case 'forgotPassword':
        return <ForgotPasswordPage />;

      case 'profile':
        return (
          <ProfilePage
            favoritesCount={favorites.length}
            readingCount={readingProgress.length}
            recentStories={recentStories}
            pageHistory={pageHistory}
            onNavigate={handleSetPage}
            onGoBack={goBack}
            onStartReading={handleSelectStory}
          />
        );

      case 'admin':
        return <Suspense fallback={<div className="min-h-screen bg-kid-bg flex items-center justify-center"><span className="loading-spinner" /></div>}><AdminPage /></Suspense>;

      case 'dataManager':
        return <Suspense fallback={<div className="min-h-screen bg-kid-bg flex items-center justify-center"><span className="loading-spinner" /></div>}><DataManagerPage /></Suspense>;

      case 'globalSettings':
        return <Suspense fallback={<div className="min-h-screen bg-kid-bg flex items-center justify-center"><span className="loading-spinner" /></div>}><GlobalSettingsPage /></Suspense>;

      case 'aiAssistant':
        return <AIAssistantPage />;

      case 'library':
        return (
          <StoryLibrary
            onSelectStory={handleSelectStory}
            onOpenSettings={() => handleSetPage('settings')}
            onOpenProfile={() => handleSetPage('profile')}
            favorites={favorites.map(f => f.storyId)}
            onToggleFavorite={handleToggleFavorite}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            viewScale={viewScale}
            onViewScaleChange={setViewScale}
          />
        );

      case 'reading':
        if (!currentStoryId) return null;
        return (
          <ReadingPage
            storyId={currentStoryId}
            viewMode={currentViewMode}
            onViewModeChange={setCurrentViewMode}
            onBack={goHome}
            onComplete={handleReadingComplete}
            onProgress={handleReadingProgress}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            aiConfig={aiConfig}
            onUpdateAIConfig={updateAIConfig}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBack={() => handleSetPage('library')}
          />
        );

      case 'collection':
        return (
          <CollectionPage
            favorites={favorites}
            readingProgress={readingProgress}
            onSelectStory={handleSelectStory}
            onRemoveFavorite={removeFavorite}
            recentStories={recentStories}
            onClearHistory={() => setRecentStories([])}
            onBack={() => handleSetPage('library')}
          />
        );

      default:
        return <SplashScreen onEnter={handleEnterFromSplash} />;
    }
  };

  const showBottomNav = isAuthenticated && !['splash', 'login', 'register', 'forgotPassword', 'reading'].includes(page);

  return (
    <div className={`app ${theme}`}>
      <main className="min-h-screen">
        <ErrorBoundary>
          <PageTransition pageKey={page}>
            {renderPage()}
          </PageTransition>
        </ErrorBoundary>
      </main>

      <Breadcrumb
        currentPage={page}
        onNavigate={handleSetPage}
      />

      {showBottomNav && (
        <BottomNav
          currentPage={page}
          onPageChange={handleSetPage}
          favoriteCount={favorites.length}
          readingStoryId={currentStoryId}
          canManageUsers={hasPermission('canManageUsers')}
          canManageData={hasPermission('canManageData')}
          canManageSettings={hasPermission('canManageSettings')}
        />
      )}

      {/* 新手引导 */}
      {showOnboarding && isAuthenticated && page === 'library' && (
        <GuideOverlay
          show={showOnboarding}
          onClose={completeOnboarding}
          steps={steps}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {/* 防沉迷弹窗 */}
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
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
