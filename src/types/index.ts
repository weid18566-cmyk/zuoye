// 故事类型
export interface Story {
  id: string;
  title: string;
  cover: string;
  category: 'grimm' | 'andersen' | 'chinese';
  categoryName: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  description: string;
  characters: Character[];
  chapters: Chapter[];
}

// 角色类型
export interface Character {
  id: string;
  name: string;
  avatar: string;
  type: 'protagonist' | 'supporting' | 'npc';
  voice?: string;
}

// 章节类型
export interface Chapter {
  id: string;
  title: string;
  content: string;
  illustration: string;
  choices?: Choice[];
}

// 选择类型
export interface Choice {
  id: string;
  text: string;
  icon: string;
  nextChapterId?: string;
}

// 阅读进度类型
export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  characterId: string;
  progress: number;
  lastReadAt: number;
}

// 收藏类型
export interface Favorite {
  storyId: string;
  addedAt: number;
}

// 视角类型
export type ViewMode = 'protagonist' | 'supporting' | 'npc';

// AI配置类型
export interface AIConfig {
  model: string;
  speechRate: number;
  contentFilter: boolean;
  maxSessionDuration: number;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 页面类型
export type Page = 'splash' | 'library' | 'reading' | 'education' | 'settings' | 'collection';

// 幼教内容类型
export interface EducationContent {
  type: 'character' | 'emotion';
  title: string;
  items: EducationItem[];
}

export interface EducationItem {
  id: string;
  content: string;
  image?: string;
  audio?: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
}
