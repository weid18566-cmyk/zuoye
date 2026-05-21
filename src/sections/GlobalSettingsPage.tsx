import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { GlobalSettings, Theme, FontFamily, Language } from '@/types';
import { safeJsonParse } from '@/lib/utils';

const DEFAULT_SHORTCUTS = {
  toggleReading: 'Space',
  nextChapter: 'ArrowRight',
  prevChapter: 'ArrowLeft',
  toggleFavorite: 'F',
  goHome: 'H',
};

const STORAGE_KEY = 'kidstory-global-settings';

function loadSettings(): GlobalSettings {
  const defaults: GlobalSettings = {
    theme: 'light',
    fontFamily: 'default',
    language: 'zh-CN',
    fontSize: 'medium',
    autoSaveInterval: 30,
    shortcuts: DEFAULT_SHORTCUTS,
  };

  const saved = safeJsonParse<Partial<GlobalSettings>>(localStorage.getItem(STORAGE_KEY), {});
  const theme: Theme = saved.theme === 'dark' ? 'dark' : 'light';
  const fontFamily: FontFamily = saved.fontFamily || defaults.fontFamily;
  const language: Language = saved.language || defaults.language;
  const fontSize = saved.fontSize || defaults.fontSize;
  const autoSaveInterval =
    typeof saved.autoSaveInterval === 'number' ? saved.autoSaveInterval : defaults.autoSaveInterval;
  const shortcuts = { ...DEFAULT_SHORTCUTS, ...(saved.shortcuts || {}) };

  return { theme, fontFamily, language, fontSize, autoSaveInterval, shortcuts };
}

function saveSettings(settings: GlobalSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function GlobalSettingsPage() {
  const { hasPermission, setCurrentPage } = useAuth();
  const canManage = hasPermission('canManageSettings');
  const [settings, setSettings] = useState<GlobalSettings>(loadSettings);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const update = (partial: Partial<GlobalSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  };

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentPage('profile')} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <h1 className="font-title text-kid-lg text-kid-text">全局设置</h1>
        </div>
      </header>

      <main className="px-5 space-y-6">
        {/* 外观主题 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-purple-500 text-2xl">palette</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">外观主题</h2>
              <p className="text-kid-xs text-kid-text/60">选择界面配色方案</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'light' as Theme, label: '浅色模式', icon: 'light_mode' },
              { value: 'dark' as Theme, label: '深色模式', icon: 'dark_mode' },
            ]).map((t) => (
              <button
                key={t.value}
                onClick={() => canManage && update({ theme: t.value })}
                disabled={!canManage}
                className={`p-4 rounded-kid-md border-2 transition-all text-center ${
                  settings.theme === t.value
                    ? 'border-kid-primary bg-kid-primary/5'
                    : 'border-kid-border hover:border-kid-primary/50'
                } ${!canManage ? 'opacity-50' : ''}`}
              >
                <span className="material-symbols-rounded text-2xl text-kid-primary">{t.icon}</span>
                <p className="text-kid-sm font-medium text-kid-text mt-2">{t.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 字体设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-blue-500 text-2xl">font_download</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">字体设置</h2>
              <p className="text-kid-xs text-kid-text/60">选择阅读字体和字号</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-kid-xs text-kid-text/60 mb-2">字体样式</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'default' as FontFamily, label: '系统默认', sample: 'Aa' },
                  { value: 'serif' as FontFamily, label: '宋体', sample: 'Aa', style: 'font-serif' },
                  { value: 'sans' as FontFamily, label: '黑体', sample: 'Aa', style: 'font-sans' },
                  { value: 'cursive' as FontFamily, label: '儿童体', sample: 'Aa', style: 'font-title' },
                ]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => canManage && update({ fontFamily: f.value })}
                    disabled={!canManage}
                    className={`p-4 rounded-kid-md border-2 transition-all ${
                      settings.fontFamily === f.value
                        ? 'border-kid-primary bg-kid-primary/5'
                        : 'border-kid-border hover:border-kid-primary/50'
                    } ${!canManage ? 'opacity-50' : ''}`}
                  >
                    <span className={`text-kid-xl block ${f.style || ''}`}>{f.sample}</span>
                    <span className="text-kid-xs text-kid-text/60 mt-1">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-kid-xs text-kid-text/60 mb-2">字号大小</p>
              <div className="flex gap-2">
                {([
                  { value: 'small' as const, label: '小' },
                  { value: 'medium' as const, label: '中' },
                  { value: 'large' as const, label: '大' },
                ]).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => canManage && update({ fontSize: s.value })}
                    disabled={!canManage}
                    className={`flex-1 py-3 rounded-kid-md border-2 transition-all ${
                      settings.fontSize === s.value
                        ? 'border-kid-primary bg-kid-primary/5'
                        : 'border-kid-border'
                    } ${!canManage ? 'opacity-50' : ''}`}
                  >
                    <span className="text-kid-sm text-kid-text">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 语言设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-green-500 text-2xl">translate</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">语言</h2>
              <p className="text-kid-xs text-kid-text/60">切换界面语言</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'zh-CN' as Language, label: '中文' },
              { value: 'en' as Language, label: 'English' },
              { value: 'ja' as Language, label: '日本語' },
            ]).map((l) => (
              <button
                key={l.value}
                onClick={() => canManage && update({ language: l.value })}
                disabled={!canManage}
                className={`py-4 rounded-kid-md border-2 transition-all ${
                  settings.language === l.value
                    ? 'border-kid-primary bg-kid-primary/5'
                    : 'border-kid-border hover:border-kid-primary/50'
                } ${!canManage ? 'opacity-50' : ''}`}
              >
                <span className="text-kid-sm font-medium text-kid-text">{l.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 快捷键设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-orange-500 text-2xl">keyboard</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">快捷键</h2>
              <p className="text-kid-xs text-kid-text/60">自定义键盘快捷操作</p>
            </div>
          </div>

          <div className="space-y-3">
            {([
              { key: 'toggleReading' as keyof typeof settings.shortcuts, label: '暂停/播放朗读' },
              { key: 'nextChapter' as keyof typeof settings.shortcuts, label: '下一章节' },
              { key: 'prevChapter' as keyof typeof settings.shortcuts, label: '上一章节' },
              { key: 'toggleFavorite' as keyof typeof settings.shortcuts, label: '收藏/取消收藏' },
              { key: 'goHome' as keyof typeof settings.shortcuts, label: '返回主页' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-kid-sm text-kid-text">{item.label}</span>
                <input
                  type="text"
                  value={settings.shortcuts[item.key]}
                  onChange={(e) => {
                    if (!canManage) return;
                    update({
                      shortcuts: {
                        ...settings.shortcuts,
                        [item.key]: e.target.value,
                      },
                    });
                  }}
                  readOnly={!canManage}
                  className="w-32 text-center py-2 px-3 rounded-kid-md border-2 border-kid-border bg-white text-kid-sm focus:outline-none focus:border-kid-primary"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 自定义参数 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-pink-500 text-2xl">tune</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">自定义参数</h2>
              <p className="text-kid-xs text-kid-text/60">调整自动保存间隔等参数</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-kid-sm text-kid-text mb-2">
                自动保存间隔（秒）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={settings.autoSaveInterval}
                  onChange={(e) => canManage && update({ autoSaveInterval: parseInt(e.target.value) })}
                  disabled={!canManage}
                  className="flex-1 h-3 rounded-full bg-kid-border appearance-none cursor-pointer accent-kid-primary"
                />
                <span className="text-kid-sm text-kid-primary w-10 text-right">
                  {settings.autoSaveInterval}s
                </span>
              </div>
            </div>
          </div>
        </section>

        {canManage && (
          <button onClick={handleSave} className="w-full btn-primary">
            <span className="material-symbols-rounded">save</span>
            <span>保存所有设置</span>
          </button>
        )}

        {!canManage && (
          <p className="text-center text-kid-xs text-kid-text/40 py-4">
            当前角色仅可查看设置，修改需家长或管理员权限
          </p>
        )}

        <div className="text-center py-4">
          <p className="text-kid-xs text-kid-text/40">童梦AI童话剧场 v1.0</p>
        </div>
      </main>

      {showSaveSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-kid-primary text-white px-6 py-3 rounded-full shadow-kid-lg animate-fade-in-up flex items-center gap-2 z-50">
          <span className="material-symbols-rounded">check_circle</span>
          <span className="text-kid-sm">设置已保存</span>
        </div>
      )}
    </div>
  );
}
