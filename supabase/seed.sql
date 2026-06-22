-- 本地开发种子数据
INSERT INTO users (id, username, email, phone, role, avatar, status, password_hash, salt, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@tongmeng.com', '13800000001', 'admin', '🦸', 'active', 'a1b2c3d4e5f6', 'salt_admin', 1719000000000),
  ('00000000-0000-0000-0000-000000000002', 'parent1', 'parent@tongmeng.com', '13800000002', 'parent', '👨‍👩‍👧', 'active', 'a1b2c3d4e5f6', 'salt_parent', 1719000000000),
  ('00000000-0000-0000-0000-000000000003', 'child1', 'child@tongmeng.com', '13800000003', 'child', '🧒', 'active', 'a1b2c3d4e5f6', 'salt_child', 1719000000000)
ON CONFLICT (id) DO NOTHING;
