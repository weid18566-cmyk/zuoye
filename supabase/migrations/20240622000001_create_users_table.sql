-- 创建用户表
-- 童梦AI童话剧场 - User Management

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'child' CHECK (role IN ('child', 'parent', 'admin')),
  avatar TEXT DEFAULT '👤',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
