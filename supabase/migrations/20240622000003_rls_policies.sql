-- Row Level Security 策略
-- 当前使用 Anon Key + 自定义认证，通过请求中的 user_id 参数进行行级别校验

-- ========== 启用 RLS ==========
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reading_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS backups ENABLE ROW LEVEL SECURITY;

-- ========== users 表：允许 anon 的 CRUD（自定义认证层处理权限） ==========
DROP POLICY IF EXISTS "Enable all for anon" ON users;
CREATE POLICY "Enable select for anon" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for anon" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for anon" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for anon" ON users
  FOR DELETE USING (true);

-- ========== stories 表 ==========
DROP POLICY IF EXISTS "stories_select_all" ON stories;
CREATE POLICY "stories_select_all" ON stories
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "stories_insert_auth" ON stories;
CREATE POLICY "stories_insert_auth" ON stories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "stories_update_auth" ON stories;
CREATE POLICY "stories_update_auth" ON stories
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "stories_delete_auth" ON stories;
CREATE POLICY "stories_delete_auth" ON stories
  FOR DELETE USING (true);

-- ========== reading_progress 策略 ==========
DROP POLICY IF EXISTS "progress_all" ON reading_progress;
CREATE POLICY "progress_select" ON reading_progress
  FOR SELECT USING (true);
CREATE POLICY "progress_insert" ON reading_progress
  FOR INSERT WITH CHECK (true);
CREATE POLICY "progress_update" ON reading_progress
  FOR UPDATE USING (true);
CREATE POLICY "progress_delete" ON reading_progress
  FOR DELETE USING (true);

-- ========== favorites 策略 ==========
DROP POLICY IF EXISTS "favorites_all" ON favorites;
CREATE POLICY "favorites_select" ON favorites
  FOR SELECT USING (true);
CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_update" ON favorites
  FOR UPDATE USING (true);
CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE USING (true);

-- ========== reading_stats 策略 ==========
DROP POLICY IF EXISTS "stats_all" ON reading_stats;
CREATE POLICY "stats_select" ON reading_stats
  FOR SELECT USING (true);
CREATE POLICY "stats_insert" ON reading_stats
  FOR INSERT WITH CHECK (true);
CREATE POLICY "stats_update" ON reading_stats
  FOR UPDATE USING (true);
CREATE POLICY "stats_delete" ON reading_stats
  FOR DELETE USING (true);

-- ========== backups 策略 ==========
DROP POLICY IF EXISTS "backups_all" ON backups;
CREATE POLICY "backups_select" ON backups
  FOR SELECT USING (true);
CREATE POLICY "backups_insert" ON backups
  FOR INSERT WITH CHECK (true);
CREATE POLICY "backups_delete" ON backups
  FOR DELETE USING (true);
