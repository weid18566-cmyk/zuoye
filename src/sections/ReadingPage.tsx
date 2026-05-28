import { useState, useCallback, useRef } from 'react';
import { stories } from '@/data/stories';
import type { ViewMode, Story, Choice } from '@/types';
import { useSwipe } from '@/hooks/useSwipe';
import { useKeyboard } from '@/hooks/useKeyboard';

interface ReadingPageProps {
  storyId: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onBack: () => void;
  onComplete: () => void;
  onProgress: (chapterId: string, progress: number) => void;
}

export function ReadingPage({ 
  storyId, 
  viewMode, 
  onViewModeChange, 
  onBack,
  onComplete,
  onProgress,
}: ReadingPageProps) {
  const story = stories.find(s => s.id === storyId);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showChoices, setShowChoices] = useState(false);
  const [showEduMode, setShowEduMode] = useState(false);
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!story || story.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-kid-bg flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-rounded text-6xl text-kid-text/30">error</span>
        <p className="text-kid-md text-kid-text/50">
          {!story ? '故事未找到' : '该故事暂无章节'}
        </p>
        <button onClick={onBack} className="btn-primary">
          <span className="material-symbols-rounded">arrow_back</span>
          <span>返回</span>
        </button>
      </div>
    );
  }

  const currentChapter = story.chapters[currentChapterIndex];
  if (!currentChapter) return null;
  const progress = ((currentChapterIndex + 1) / story.chapters.length) * 100;

  const saveCurrentProgress = useCallback((idx: number) => {
    const ch = story.chapters[idx];
    if (!ch) return;
    onProgress(ch.id, ((idx + 1) / story.chapters.length) * 100);
  }, [story, onProgress]);

  const goToChapter = useCallback((idx: number, direction: 'left' | 'right') => {
    setAnimDirection(direction);
    setTimeout(() => {
      setCurrentChapterIndex(idx);
      saveCurrentProgress(idx);
      setShowChoices(false);
      setAnimDirection(null);
    }, 150);
  }, [saveCurrentProgress]);

  const handleNext = () => {
    if (currentChapterIndex < story.chapters.length - 1) {
      goToChapter(currentChapterIndex + 1, 'left');
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      goToChapter(currentChapterIndex - 1, 'right');
    }
  };

  const handleChoice = (choice: Choice) => {
    setShowChoices(false);
    if (choice.nextChapterId) {
      const targetIdx = story.chapters.findIndex(ch => ch.id === choice.nextChapterId);
      if (targetIdx >= 0) {
        goToChapter(targetIdx, 'left');
        return;
      }
    }
    handleNext();
  };

  useSwipe(contentRef, {
    onSwipeLeft: () => handleNext(),
    onSwipeRight: () => handlePrev(),
    onTap: () => setIsPlaying(prev => !prev),
  }, { threshold: 60, enabled: !showChoices && !showEduMode });

  useKeyboard({
    enabled: !showChoices && !showEduMode,
    bindings: [
      { key: 'ArrowLeft', handler: handlePrev },
      { key: 'ArrowRight', handler: handleNext },
      { key: ' ', handler: () => setIsPlaying(prev => !prev), description: '播放/暂停' },
      { key: 'Escape', handler: onBack, description: '返回' },
      { key: 'f', handler: () => onComplete(), description: '完成阅读' },
    ],
  });

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col" ref={contentRef}>
      {/* 进度条 */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-kid-border">
        <div 
          className="h-full bg-kid-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-kid-bg/90 backdrop-blur-sm px-5 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          
          <h2 className="font-title text-kid-md text-kid-text flex-1 text-center truncate mx-4">
            {story.title}
          </h2>

          {/* 视角切换 */}
          <div className="flex gap-2">
            {(['protagonist', 'supporting', 'npc'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  viewMode === mode 
                    ? 'bg-kid-primary text-white scale-110' 
                    : 'bg-kid-border/50 text-kid-text/50'
                }`}
              >
                <span className="material-symbols-rounded">
                  {mode === 'protagonist' ? 'person' : mode === 'supporting' ? 'group' : 'visibility'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 插画区域 */}
      <div className="relative px-5 mb-6">
        <div className="aspect-[4/3] rounded-kid-lg overflow-hidden bg-kid-border shadow-kid">
          <img
            src={currentChapter.illustration}
            alt={currentChapter.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 章节标题 */}
        <div className="absolute bottom-4 left-8 right-8">
          <div className="soft-panel px-4 py-2 text-center">
            <span className="font-title text-kid-sm text-kid-text">
              第{currentChapterIndex + 1}章：{currentChapter.title}
            </span>
          </div>
        </div>
      </div>

      {/* 故事内容 */}
      <div className="flex-1 px-5 pb-32 relative overflow-hidden">
        <div
          className={`bg-white rounded-kid-lg p-6 shadow-kid transition-all duration-300 ${
            animDirection === 'left' ? 'animate-slide-out-left' :
            animDirection === 'right' ? 'animate-slide-out-right' :
            'animate-fade-in-scale'
          }`}
          key={currentChapterIndex}
        >
          <p className="text-kid-body text-kid-text leading-relaxed">
            {currentChapter.content}
          </p>
        </div>

        {/* 支线选择 */}
        {currentChapter.choices && !showChoices && (
          <button
            onClick={() => setShowChoices(true)}
            className="mt-6 w-full btn-secondary"
          >
            <span className="material-symbols-rounded">fork_right</span>
            <span>做出选择</span>
          </button>
        )}

        {showChoices && currentChapter.choices && (
          <div className="mt-6 space-y-3 animate-slide-in-up">
            <p className="text-kid-sm text-kid-text/70 text-center mb-4">你想怎么做？</p>
            {currentChapter.choices.map((choice, i) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="w-full btn-secondary justify-start animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="material-symbols-rounded">{choice.icon}</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-kid-border px-5 py-4 safe-area-bottom">
        <div className="flex items-center justify-between">
          {/* 播放控制 */}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-kid-primary text-white flex items-center justify-center shadow-kid-btn transition-transform active:scale-95"
          >
            <span className="material-symbols-rounded text-2xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* 翻页控制 */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentChapterIndex === 0}
              className="btn-icon disabled:opacity-30"
            >
              <span className="material-symbols-rounded">skip_previous</span>
            </button>
            
            <span className="text-kid-sm text-kid-text/60">
              {currentChapterIndex + 1} / {story.chapters.length}
            </span>
            
            <button 
              onClick={handleNext}
              className="btn-icon"
            >
              <span className="material-symbols-rounded">skip_next</span>
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setVolume(v => v === 0 ? 50 : 0)}
              className="btn-icon w-10 h-10"
            >
              <span className="material-symbols-rounded text-kid-primary">
                {volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>

        {/* 幼教模式入口 */}
        <button
          onClick={() => setShowEduMode(true)}
          className="mt-4 w-full py-3 rounded-kid-md bg-kid-secondary/20 text-kid-primary flex items-center justify-center gap-2"
        >
          <span className="material-symbols-rounded">school</span>
          <span className="text-kid-sm font-medium">进入幼教模式</span>
        </button>
      </div>

      {/* 幼教模式弹窗 */}
      {showEduMode && (
        <EduModeModal 
          onClose={() => setShowEduMode(false)} 
          story={story}
        />
      )}
    </div>
  );
}

interface EduModeModalProps {
  onClose: () => void;
  story: Story;
}

function EduModeModal({ onClose }: EduModeModalProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'emotion'>('character');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-title text-kid-md text-kid-text">幼教模式</h3>
          <button onClick={onClose} className="btn-icon w-10 h-10">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex-1 py-3 rounded-kid-md text-kid-sm font-medium transition-all ${
              activeTab === 'character' 
                ? 'bg-kid-primary text-white' 
                : 'bg-kid-border/50 text-kid-text'
            }`}
          >
            <span className="material-symbols-rounded mr-1">translate</span>
            识字小课堂
          </button>
          <button
            onClick={() => setActiveTab('emotion')}
            className={`flex-1 py-3 rounded-kid-md text-kid-sm font-medium transition-all ${
              activeTab === 'emotion' 
                ? 'bg-kid-primary text-white' 
                : 'bg-kid-border/50 text-kid-text'
            }`}
          >
            <span className="material-symbols-rounded mr-1">favorite</span>
            情商小提问
          </button>
        </div>

        {/* 内容 */}
        {activeTab === 'character' ? (
          <div className="grid grid-cols-3 gap-3">
            {['森', '林', '爱', '助', '勇'].map((char, i) => (
              <button
                key={char}
                className="aspect-square rounded-kid-md bg-kid-border/30 flex flex-col items-center justify-center gap-2 hover:bg-kid-primary/10 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="font-title text-4xl text-kid-text">{char}</span>
                <span className="material-symbols-rounded text-kid-primary">volume_up</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              '为什么要听爸爸妈妈的话？',
              '为什么要帮助别人？',
              '遇到危险应该怎么办？',
            ].map((q, i) => (
              <button
                key={i}
                className="w-full p-4 rounded-kid-md bg-kid-border/30 text-left hover:bg-kid-primary/10 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-kid-sm text-kid-text mb-2">{q}</p>
                <div className="flex items-center gap-2 text-kid-primary">
                  <span className="material-symbols-rounded text-sm">mic</span>
                  <span className="text-kid-xs">点击录音回答</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
