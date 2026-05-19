import { useState, useEffect, useCallback } from 'react';
import type { Theme, Page, AIConfig, ReadingProgress, Favorite, ViewMode } from '@/types';

const defaultAIConfig: AIConfig = {
  model: 'claude',
  speechRate: 0.8,
  contentFilter: true,
  maxSessionDuration: 15,
};

export function useAppState() {
  // 主题状态
  const [theme, setTheme] = useState<Theme>('light');
  
  // 当前页面
  const [currentPage, setCurrentPage] = useState<Page>('splash');
  
  // AI配置
  const [aiConfig, setAIConfig] = useState<AIConfig>(defaultAIConfig);
  
  // 阅读进度
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  
  // 收藏列表
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  
  // 当前阅读的故事和视角
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>('protagonist');
  
  // 幼教模式
  const [isEducationMode, setIsEducationMode] = useState(false);
  
  // 防沉迷计时
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedTheme = localStorage.getItem('kidstory-theme') as Theme;
    const savedAIConfig = localStorage.getItem('kidstory-ai-config');
    const savedProgress = localStorage.getItem('kidstory-progress');
    const savedFavorites = localStorage.getItem('kidstory-favorites');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedAIConfig) setAIConfig(JSON.parse(savedAIConfig));
    if (savedProgress) setReadingProgress(JSON.parse(savedProgress));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('kidstory-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kidstory-ai-config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('kidstory-progress', JSON.stringify(readingProgress));
  }, [readingProgress]);

  useEffect(() => {
    localStorage.setItem('kidstory-favorites', JSON.stringify(favorites));
  }, [favorites]);

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
  }, []);

  // 检查使用时长
  useEffect(() => {
    const checkTime = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const maxDuration = aiConfig.maxSessionDuration * 60 * 1000;
      if (elapsed > maxDuration && currentPage === 'reading') {
        setShowTimeLimitModal(true);
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(checkTime);
  }, [sessionStartTime, aiConfig.maxSessionDuration, currentPage]);

  // 返回主页
  const goHome = useCallback(() => {
    setCurrentStoryId(null);
    setCurrentPage('library');
    setIsEducationMode(false);
  }, []);

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
    currentStoryId,
    currentViewMode,
    setCurrentViewMode,
    startReading,
    isEducationMode,
    setIsEducationMode,
    showTimeLimitModal,
    setShowTimeLimitModal,
    goHome,
  };
}
