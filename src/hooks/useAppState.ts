import { useState, useEffect, useCallback } from 'react';
import type { Theme, Page, AIConfig, ReadingProgress, Favorite, ViewMode, LayoutMode, SortOrder, ViewScale, RecentStory, PageVisit } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { safeJsonParse } from '@/lib/utils';
import { getDefaultAIConfig } from '@/lib/ai-client';

const defaultAIConfig: AIConfig = getDefaultAIConfig();

function getStorageKey(userId: string, suffix: string): string {
  return `kidstory-${userId}-${suffix}`;
}

export function useAppState() {
  const { user, currentPage, setCurrentPage } = useAuth();
  const userId = user?.id || 'guest';

  // 主题状态
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'theme'));
    return saved === 'dark' ? 'dark' : 'light';
  });

  // 视图配置
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'layoutMode'));
    return (saved as LayoutMode) || 'grid';
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'sortOrder'));
    return (saved as SortOrder) || 'default';
  });
  const [viewScale, setViewScale] = useState<ViewScale>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'viewScale'));
    return (saved as ViewScale) || 'medium';
  });

  // AI配置
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'config'));
    const parsed = safeJsonParse<Partial<AIConfig>>(saved, {});
    const merged = { ...defaultAIConfig, ...parsed };
    if (!merged.apiKey) merged.apiKey = defaultAIConfig.apiKey;
    return merged;
  });

  // 阅读进度
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'progress'));
    const parsed = safeJsonParse<ReadingProgress[]>(saved, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  // 收藏列表
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'favorites'));
    const parsed = safeJsonParse<Favorite[]>(saved, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [recentStories, setRecentStories] = useState<RecentStory[]>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'recentStories'));
    const parsed = safeJsonParse<RecentStory[]>(saved, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  const [pageHistory, setPageHistory] = useState<PageVisit[]>(() => {
    const saved = localStorage.getItem(getStorageKey(userId, 'pageHistory'));
    const parsed = safeJsonParse<PageVisit[]>(saved, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  // 当前阅读的故事和视角
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>('protagonist');

  // 幼教模式
  const [isEducationMode, setIsEducationMode] = useState(false);

  // 防沉迷计时
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);

  // 当用户切换时重新加载数据
  useEffect(() => {
    const savedTheme = localStorage.getItem(getStorageKey(userId, 'theme'));
    const savedConfig = localStorage.getItem(getStorageKey(userId, 'config'));
    const savedProgress = localStorage.getItem(getStorageKey(userId, 'progress'));
    const savedFavorites = localStorage.getItem(getStorageKey(userId, 'favorites'));
    const savedRecentStories = localStorage.getItem(getStorageKey(userId, 'recentStories'));
    const savedPageHistory = localStorage.getItem(getStorageKey(userId, 'pageHistory'));

    setTheme(savedTheme === 'dark' ? 'dark' : 'light');

    const parsedConfig = safeJsonParse<Partial<AIConfig>>(savedConfig, {});
    const mergedConfig = { ...defaultAIConfig, ...parsedConfig };
    if (!mergedConfig.apiKey) mergedConfig.apiKey = defaultAIConfig.apiKey;
    setAIConfig(mergedConfig);

    const parsedProgress = safeJsonParse<ReadingProgress[]>(savedProgress, []);
    setReadingProgress(Array.isArray(parsedProgress) ? parsedProgress : []);

    const parsedFavorites = safeJsonParse<Favorite[]>(savedFavorites, []);
    setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);

    const parsedRecentStories = safeJsonParse<RecentStory[]>(savedRecentStories, []);
    setRecentStories(Array.isArray(parsedRecentStories) ? parsedRecentStories : []);

    const parsedPageHistory = safeJsonParse<PageVisit[]>(savedPageHistory, []);
    setPageHistory(Array.isArray(parsedPageHistory) ? parsedPageHistory : []);
  }, [userId]);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'theme'), theme);
  }, [theme, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'config'), JSON.stringify(aiConfig));
  }, [aiConfig, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'progress'), JSON.stringify(readingProgress));
  }, [readingProgress, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'favorites'), JSON.stringify(favorites));
  }, [favorites, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'recentStories'), JSON.stringify(recentStories));
  }, [recentStories, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'pageHistory'), JSON.stringify(pageHistory));
  }, [pageHistory, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'layoutMode'), layoutMode);
  }, [layoutMode, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'sortOrder'), sortOrder);
  }, [sortOrder, userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId, 'viewScale'), viewScale);
  }, [viewScale, userId]);

  useEffect(() => {
    setPageHistory((prev) => {
      const last = prev[0];
      if (last && last.page === currentPage) return prev;
      const next: PageVisit = { page: currentPage, visitedAt: Date.now() };
      return [next, ...prev].slice(0, 50);
    });
  }, [currentPage]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // 更新AI配置
  const updateAIConfig = useCallback((config: Partial<AIConfig>) => {
    setAIConfig(prev => ({ ...prev, ...config }));
  }, []);

  // 保存阅读进度
  const saveProgress = useCallback((progress: ReadingProgress) => {
    setReadingProgress(prev => {
      const existing = prev.findIndex(p => p.storyId === progress.storyId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = progress;
        return updated;
      }
      return [...prev, progress];
    });
  }, []);

  // 获取故事进度
  const getStoryProgress = useCallback((storyId: string) => {
    return readingProgress.find(p => p.storyId === storyId);
  }, [readingProgress]);

  // 添加收藏
  const addFavorite = useCallback((storyId: string) => {
    setFavorites(prev => {
      if (prev.some(f => f.storyId === storyId)) return prev;
      return [...prev, { storyId, addedAt: Date.now() }];
    });
  }, []);

  // 移除收藏
  const removeFavorite = useCallback((storyId: string) => {
    setFavorites(prev => prev.filter(f => f.storyId !== storyId));
  }, []);

  // 检查是否收藏
  const isFavorite = useCallback((storyId: string) => {
    return favorites.some(f => f.storyId === storyId);
  }, [favorites]);

  // 开始阅读故事
  const startReading = useCallback((storyId: string) => {
    setCurrentStoryId(storyId);
    setCurrentPage('reading');
    setSessionStartTime(Date.now());
    setRecentStories((prev) => {
      const next: RecentStory = { storyId, lastOpenedAt: Date.now() };
      const filtered = prev.filter((s) => s.storyId !== storyId);
      return [next, ...filtered].slice(0, 30);
    });
  }, [setCurrentPage]);

  const goBack = useCallback(() => {
    let targetPage: Page | null = null;
    setPageHistory((prev) => {
      const next = [...prev];
      const current = next.shift();
      const prevNonDup = next.find((p) => p.page !== current?.page);
      if (prevNonDup) targetPage = prevNonDup.page;
      return next;
    });
    if (targetPage) setCurrentPage(targetPage);
  }, [setCurrentPage]);

  // 检查使用时长
  useEffect(() => {
    if (sessionStartTime <= 0) return;
    const checkTime = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const maxDuration = aiConfig.maxSessionDuration * 60 * 1000;
      if (elapsed > maxDuration && currentPage === 'reading') {
        setShowTimeLimitModal(true);
      }
    }, 60000);

    return () => clearInterval(checkTime);
  }, [sessionStartTime, aiConfig.maxSessionDuration, currentPage]);

  // 返回主页
  const goHome = useCallback(() => {
    setCurrentStoryId(null);
    setCurrentPage('library');
    setIsEducationMode(false);
    setSessionStartTime(0);
    setShowTimeLimitModal(false);
  }, [setCurrentPage]);

  return {
    theme,
    toggleTheme,
    currentPage,
    setCurrentPage,
    aiConfig,
    updateAIConfig,
    readingProgress,
    saveProgress,
    getStoryProgress,
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
    isEducationMode,
    setIsEducationMode,
    showTimeLimitModal,
    setShowTimeLimitModal,
    goHome,
    layoutMode,
    setLayoutMode,
    sortOrder,
    setSortOrder,
    viewScale,
    setViewScale,
  };
}
