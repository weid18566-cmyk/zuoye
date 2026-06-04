// 故事类型
export interface Story {
  id: string;
  title: string;
  cover: string;
  category: 'grimm' | 'andersen' | 'chinese' | 'fable' | 'myth' | 'ai-branch';
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

export interface RecentStory {
  storyId: string;
  lastOpenedAt: number;
}

export interface PageVisit {
  page: Page;
  visitedAt: number;
}

// 视角类型
export type ViewMode = 'protagonist' | 'supporting' | 'npc';

// AI配置类型
export interface AIConfig {
  model: string;
  speechRate: number;
  contentFilter: boolean;
  maxSessionDuration: number;
  provider: AIProvider;
  apiKey: string;
  apiEndpoint: string;
  temperature: number;
  maxTokens: number;
}

export type AIProvider = 'deepseek' | 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxTokens: number;
}

// AI 调用请求
export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

// AI 调用响应
export interface AIResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
  error?: string;
}

// 对话消息
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 字体类型
export type FontFamily = 'default' | 'serif' | 'sans' | 'mono' | 'cursive';

// 语言类型
export type Language = 'zh-CN' | 'en' | 'ja';

// 页面类型
export type Page = 'splash' | 'library' | 'reading' | 'education' | 'settings' | 'collection' |
  'login' | 'register' | 'forgotPassword' | 'profile' | 'admin' | 'dataManager' | 'globalSettings' | 'aiAssistant';

// 用户角色类型
export type UserRole = 'admin' | 'parent' | 'child';

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  createdAt: number;
  status: 'active' | 'disabled';
  parentId: string | null;
}

// 用户凭证（仅用于注册/登录）
export interface UserCredential {
  id: string;
  passwordHash: string;
  salt: string;
}

// 权限定义
export interface Permission {
  canRead: boolean;
  canLike: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageData: boolean;
}

// 全局设置类型
export interface GlobalSettings {
  theme: Theme;
  fontFamily: FontFamily;
  language: Language;
  fontSize: 'small' | 'medium' | 'large';
  autoSaveInterval: number;
  shortcuts: ShortcutConfig;
}

// 快捷键配置
export interface ShortcutConfig {
  toggleReading: string;
  nextChapter: string;
  prevChapter: string;
  toggleFavorite: string;
  goHome: string;
}

// 备份数据类型
export interface BackupData {
  version: string;
  exportedAt: number;
  users: (User & { passwordHash?: string; salt?: string })[];
  userData: Record<string, {
    readingProgress: ReadingProgress[];
    favorites: Favorite[];
    aiConfig: AIConfig;
  }>;
}

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

// 视图布局模式
export type LayoutMode = 'grid' | 'list' | 'compact';

// 排序方式
export type SortOrder = 'default' | 'name-asc' | 'name-desc' | 'age-asc' | 'age-desc' | 'recent';

// 视图缩放比例
export type ViewScale = 'small' | 'medium' | 'large';

// 视图配置
export interface ViewConfig {
  layoutMode: LayoutMode;
  sortOrder: SortOrder;
  viewScale: ViewScale;
  showFilters: boolean;
}

// Toast消息类型
export interface ToastMessage {
  id: string;
  content: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// 新手引导步骤
export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: string;
}

// 面包屑节点
export interface BreadcrumbNode {
  label: string;
  page?: Page;
  icon?: string;
}

// 导航菜单项
export interface NavMenuItem {
  id: Page;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
  children?: NavMenuSubItem[];
  permission?: keyof Permission;
}

export interface NavMenuSubItem {
  id: Page;
  label: string;
  icon: string;
  permission?: keyof Permission;
}
