import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { safeJsonParse } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: ReadingStats) => boolean;
}

export interface ReadingStats {
  totalStoriesCompleted: number;
  totalChaptersRead: number;
  totalReadingMinutes: number;
  readingDays: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  favoriteCategory: string | null;
  achievements: string[];
}

const defaultStats: ReadingStats = {
  totalStoriesCompleted: 0,
  totalChaptersRead: 0,
  totalReadingMinutes: 0,
  readingDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  favoriteCategory: null,
  achievements: [],
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-story', title: '初次冒险', description: '完成第一个故事', icon: 'emoji_events', condition: s => s.totalStoriesCompleted >= 1 },
  { id: 'five-stories', title: '故事探险家', description: '完成5个故事', icon: 'explore', condition: s => s.totalStoriesCompleted >= 5 },
  { id: 'ten-stories', title: '故事大师', description: '完成10个故事', icon: 'auto_stories', condition: s => s.totalStoriesCompleted >= 10 },
  { id: 'streak-3', title: '三天坚持', description: '连续阅读3天', icon: 'local_fire_department', condition: s => s.currentStreak >= 3 },
  { id: 'streak-7', title: '阅读周', description: '连续阅读7天', icon: 'whatshot', condition: s => s.currentStreak >= 7 },
  { id: 'chapters-20', title: '爱读书', description: '累计阅读20个章节', icon: 'menu_book', condition: s => s.totalChaptersRead >= 20 },
  { id: 'chapters-50', title: '书虫', description: '累计阅读50个章节', icon: 'book', condition: s => s.totalChaptersRead >= 50 },
  { id: 'minutes-60', title: '一小时读者', description: '累计阅读60分钟', icon: 'hourglass_top', condition: s => s.totalReadingMinutes >= 60 },
  { id: 'minutes-300', title: '阅读达人', description: '累计阅读300分钟', icon: 'timer', condition: s => s.totalReadingMinutes >= 300 },
];

function getStorageKey(userId: string): string {
  return `kidstory-${userId}-readingStats`;
}

export function useReadingStats() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [stats, setStats] = useState<ReadingStats>(() => {
    const saved = localStorage.getItem(getStorageKey(userId));
    const parsed = safeJsonParse<Partial<ReadingStats>>(saved, {});
    return { ...defaultStats, ...parsed };
  });

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(stats));
  }, [stats, userId]);

  const recordChapterRead = useCallback((durationMinutes = 0) => {
    setStats(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = prev.lastReadDate !== today;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const streakContinued = prev.lastReadDate === yesterday;

      return {
        ...prev,
        totalChaptersRead: prev.totalChaptersRead + 1,
        totalReadingMinutes: prev.totalReadingMinutes + durationMinutes,
        readingDays: isNewDay ? prev.readingDays + 1 : prev.readingDays,
        currentStreak: isNewDay
          ? (streakContinued ? prev.currentStreak + 1 : 1)
          : prev.currentStreak,
        longestStreak: Math.max(prev.longestStreak,
          isNewDay ? (streakContinued ? prev.currentStreak + 1 : 1) : prev.currentStreak),
        lastReadDate: today,
      };
    });
  }, []);

  const recordStoryComplete = useCallback((category?: string) => {
    setStats(prev => ({
      ...prev,
      totalStoriesCompleted: prev.totalStoriesCompleted + 1,
      favoriteCategory: category || prev.favoriteCategory,
    }));
  }, []);

  const unlockAchievements = useCallback(() => {
    setStats(prev => {
      const newAchievements = [...prev.achievements];
      for (const ach of ACHIEVEMENTS) {
        if (!newAchievements.includes(ach.id) && ach.condition(prev)) {
          newAchievements.push(ach.id);
        }
      }
      if (newAchievements.length === prev.achievements.length) return prev;
      return { ...prev, achievements: newAchievements };
    });
  }, []);

  const newAchievements = ACHIEVEMENTS.filter(
    ach => ach.condition(stats) && !stats.achievements.includes(ach.id)
  );

  return {
    stats,
    recordChapterRead,
    recordStoryComplete,
    unlockAchievements,
    newAchievements,
  };
}
