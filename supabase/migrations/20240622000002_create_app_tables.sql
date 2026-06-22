-- 应用功能表：阅读进度、收藏、故事元数据

-- 故事库（缓存AI生成的故事）
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT,
  age_range TEXT,
  category TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);

-- 阅读进度
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  story_key TEXT,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_read_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  UNIQUE(user_id, story_id),
  UNIQUE(user_id, story_key)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_last_read ON reading_progress(last_read_at DESC);

-- 收藏夹
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  story_key TEXT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  UNIQUE(user_id, story_id),
  UNIQUE(user_id, story_key)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- 阅读统计
CREATE TABLE IF NOT EXISTS reading_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_stories_read INTEGER DEFAULT 0,
  total_reading_time_sec INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  last_read_date TEXT,
  achievements TEXT DEFAULT '[]',
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_stats_user ON reading_stats(user_id);

-- 备份记录
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_backups_user ON backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created ON backups(created_at DESC);
