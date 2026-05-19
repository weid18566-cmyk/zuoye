import { useState } from 'react';
import { aiModels } from '@/data/stories';
import type { AIConfig, Theme } from '@/types';

interface SettingsPageProps {
  aiConfig: AIConfig;
  onUpdateAIConfig: (config: Partial<AIConfig>) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onBack: () => void;
}

export function SettingsPage({ 
  aiConfig, 
  onUpdateAIConfig, 
  theme, 
  onToggleTheme,
  onBack 
}: SettingsPageProps) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      {/* 头部 */}
      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <h1 className="font-title text-kid-lg text-kid-text">设置</h1>
        </div>
      </header>

      {/* 设置内容 */}
      <main className="px-5 space-y-6">
        {/* AI模型设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-kid-primary/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-kid-primary text-2xl">smart_toy</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">AI模型</h2>
              <p className="text-kid-xs text-kid-text/60">选择本地AI模型</p>
            </div>
          </div>

          <div className="space-y-3">
            {aiModels.map((model) => (
              <label
                key={model.id}
                className={`flex items-center gap-4 p-4 rounded-kid-md border-2 cursor-pointer transition-all ${
                  aiConfig.model === model.id
                    ? 'border-kid-primary bg-kid-primary/5'
                    : 'border-kid-border hover:border-kid-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="aiModel"
                  value={model.id}
                  checked={aiConfig.model === model.id}
                  onChange={() => onUpdateAIConfig({ model: model.id })}
                  className="w-5 h-5 accent-kid-primary"
                />
                <div className="flex-1">
                  <p className="text-kid-sm font-medium text-kid-text">{model.name}</p>
                  <p className="text-kid-xs text-kid-text/60">{model.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* 语速设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-kid-secondary/20 flex items-center justify-center">
              <span className="material-symbols-rounded text-kid-primary text-2xl">speed</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">生成语速</h2>
              <p className="text-kid-xs text-kid-text/60">调节AI朗读速度</p>
            </div>
          </div>

          <div className="px-2">
            <div className="flex items-center gap-4">
              <span className="material-symbols-rounded text-kid-text/40">slow_motion_video</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={aiConfig.speechRate}
                onChange={(e) => onUpdateAIConfig({ speechRate: parseFloat(e.target.value) })}
                className="flex-1 h-3 rounded-full bg-kid-border appearance-none cursor-pointer accent-kid-primary"
              />
              <span className="material-symbols-rounded text-kid-text/40">fast_forward</span>
            </div>
            <p className="text-center text-kid-sm text-kid-primary mt-2">
              {Math.round(aiConfig.speechRate * 100)}%
            </p>
          </div>
        </section>

        {/* 内容安全 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-rounded text-kid-primary text-2xl">shield</span>
              </div>
              <div>
                <h2 className="font-title text-kid-md text-kid-text">内容安全过滤</h2>
                <p className="text-kid-xs text-kid-text/60">自动过滤不当内容</p>
              </div>
            </div>
            
            <button
              onClick={() => onUpdateAIConfig({ contentFilter: !aiConfig.contentFilter })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                aiConfig.contentFilter ? 'bg-kid-primary' : 'bg-kid-border'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  aiConfig.contentFilter ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 使用时长限制 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-orange-500 text-2xl">timer</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">单次使用时长</h2>
              <p className="text-kid-xs text-kid-text/60">防沉迷保护</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[10, 15, 20].map((minutes) => (
              <button
                key={minutes}
                onClick={() => onUpdateAIConfig({ maxSessionDuration: minutes })}
                className={`py-4 rounded-kid-md text-kid-sm font-medium transition-all ${
                  aiConfig.maxSessionDuration === minutes
                    ? 'bg-kid-primary text-white'
                    : 'bg-kid-border/50 text-kid-text hover:bg-kid-primary/10'
                }`}
              >
                {minutes}分钟
              </button>
            ))}
          </div>
        </section>

        {/* 主题设置 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-symbols-rounded text-purple-500 text-2xl">
                  {theme === 'light' ? 'light_mode' : 'dark_mode'}
                </span>
              </div>
              <div>
                <h2 className="font-title text-kid-md text-kid-text">
                  {theme === 'light' ? '浅色模式' : '深色模式'}
                </h2>
                <p className="text-kid-xs text-kid-text/60">切换界面主题</p>
              </div>
            </div>
            
            <button
              onClick={onToggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-kid-primary' : 'bg-kid-border'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className="w-full btn-primary"
        >
          <span className="material-symbols-rounded">save</span>
          <span>保存设置</span>
        </button>

        {/* 关于 */}
        <div className="text-center py-8">
          <p className="text-kid-xs text-kid-text/40">童梦AI童话剧场 v1.0</p>
          <p className="text-kid-xs text-kid-text/40 mt-1">专为3-8岁儿童设计</p>
        </div>
      </main>

      {/* 保存成功提示 */}
      {showSaveSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-kid-primary text-white px-6 py-3 rounded-full shadow-kid-lg animate-fade-in-up flex items-center gap-2">
          <span className="material-symbols-rounded">check_circle</span>
          <span className="text-kid-sm">保存成功</span>
        </div>
      )}
    </div>
  );
}
