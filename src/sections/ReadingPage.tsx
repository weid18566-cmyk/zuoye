import { useState, useCallback, useRef, useEffect } from 'react';
import { stories } from '@/data/stories';
import type { ViewMode, Story, Choice } from '@/types';
import { useSwipe } from '@/hooks/useSwipe';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useTTS } from '@/hooks/useTTS';
import { useAI } from '@/hooks/useAI';
import type { AIResponse } from '@/types';

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
  const [volume, setVolume] = useState(50);
  const [showChoices, setShowChoices] = useState(false);
  const [showEduMode, setShowEduMode] = useState(false);
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);
  const tts = useTTS({ rate: 0.9, lang: 'zh-CN', onEnd: () => {
    if (currentChapterIndex < story.chapters.length - 1) {
      setAnimDirection('left');
      setTimeout(() => {
        const next = currentChapterIndex + 1;
        setCurrentChapterIndex(next);
        saveCurrentProgress(next);
        setAnimDirection(null);
        tts.speak(story.chapters[next].content);
      }, 200);
    }
  }});
  const ai = useAI();
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => tts.stop();
  }, []);

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
    onTap: () => tts.toggle(currentChapter.content),
  }, { threshold: 60, enabled: !showChoices && !showEduMode });

  useKeyboard({
    enabled: !showChoices && !showEduMode,
    bindings: [
      { key: 'ArrowLeft', handler: handlePrev },
      { key: 'ArrowRight', handler: handleNext },
      { key: ' ', handler: () => tts.toggle(currentChapter.content), description: '播放/暂停' },
      { key: 'Escape', handler: () => { tts.stop(); onBack(); }, description: '返回' },
      { key: 'f', handler: () => onComplete(), description: '完成阅读' },
    ],
  });

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col overflow-y-auto" ref={contentRef}>
      {/* 进度条 */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-kid-border">
        <div 
          className="h-full bg-kid-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-kid-bg/95 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { tts.stop(); onBack(); }} className="btn-icon w-10 h-10">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          
          <h2 className="font-title text-kid-sm text-kid-text flex-1 text-center truncate mx-2">
            {story.title}
          </h2>

          <div className="flex gap-1">
            {(['protagonist', 'supporting', 'npc'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all text-xs ${
                  viewMode === mode 
                    ? 'bg-kid-primary text-white scale-105' 
                    : 'bg-kid-border/30 text-kid-text/40'
                }`}
              >
                <span className="material-symbols-rounded text-base">
                  {mode === 'protagonist' ? 'person' : mode === 'supporting' ? 'group' : 'visibility'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 插画区域 */}
      <div className="px-4 pt-2">
        <div className="relative max-w-2xl mx-auto">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-kid-border shadow-kid">
            <img
              src={currentChapter.illustration}
              alt={currentChapter.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="soft-panel px-4 py-1.5 text-center inline-block">
              <span className="font-title text-kid-xs text-kid-text/80">
                第{currentChapterIndex + 1}章 · {currentChapter.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 故事内容 */}
      <div className="flex-1 px-4 pt-4 pb-40 relative flex flex-col items-center">
        <div
          className={`w-full max-w-2xl bg-white rounded-[2rem] p-6 shadow-kid border border-kid-border/30 transition-all duration-300 ${
            animDirection === 'left' ? 'animate-slide-out-left' :
            animDirection === 'right' ? 'animate-slide-out-right' :
            'animate-fade-in-scale'
          }`}
          key={currentChapterIndex}
        >
          <div className="text-kid-body text-kid-text leading-[1.9] whitespace-pre-line">
            {currentChapter.content}
          </div>
        </div>

        {/* 支线选择 */}
        <div className="w-full max-w-2xl mt-4 space-y-2">
          {currentChapter.choices && !showChoices && (
            <button
              onClick={() => setShowChoices(true)}
              className="w-full py-3 rounded-2xl bg-kid-primary/10 text-kid-primary font-medium flex items-center justify-center gap-2 hover:bg-kid-primary/20 transition-colors"
            >
              <span className="material-symbols-rounded">fork_right</span>
              <span className="text-kid-sm">做出选择</span>
            </button>
          )}

          {showChoices && currentChapter.choices && (
            <>
              <p className="text-kid-xs text-kid-text/50 text-center">你想怎么做？</p>
              {currentChapter.choices.map((choice, i) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full py-3 px-5 rounded-2xl bg-white border-2 border-kid-border text-left flex items-center gap-3 hover:border-kid-primary/40 active:scale-[0.98] transition-all animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="material-symbols-rounded text-kid-primary text-xl">{choice.icon}</span>
                  <span className="text-kid-sm text-kid-text">{choice.text}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-kid-border px-4 py-3 safe-area-bottom z-50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button 
            onClick={() => tts.toggle(currentChapter.content)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
              tts.isSpeaking && !tts.isPaused ? 'bg-kid-primary text-white animate-pulse-soft' : 'bg-kid-border/30 text-kid-text/60'
            }`}
          >
            <span className="material-symbols-rounded text-xl">
              {tts.isSpeaking && !tts.isPaused ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button onClick={handlePrev} disabled={currentChapterIndex === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-20 text-kid-text/60 hover:text-kid-primary transition-colors">
              <span className="material-symbols-rounded">skip_previous</span>
            </button>
            
            <span className="text-kid-xs text-kid-text/40 tabular-nums w-14 text-center">
              {currentChapterIndex + 1}/{story.chapters.length}
            </span>
            
            <button onClick={handleNext}
              className="w-10 h-10 rounded-full flex items-center justify-center text-kid-text/60 hover:text-kid-primary transition-colors">
              <span className="material-symbols-rounded">skip_next</span>
            </button>
          </div>

          <button onClick={() => setVolume(v => v === 0 ? 50 : 0)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-kid-text/40 hover:text-kid-primary transition-colors">
            <span className="material-symbols-rounded text-lg">
              {volume === 0 ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        </div>

        {/* AI + 幼教入口行 */}
        <div className="flex items-center gap-2 max-w-2xl mx-auto mt-3">
          <button onClick={async () => {
            if (!ai.aiConfig.apiKey && ai.aiConfig.provider !== 'ollama') {
              setAIResponse({ content: '', model: '', error: '请先在设置中配置AI接口' });
              return;
            }
            setShowAIChat(prev => {
              const willShow = !prev;
              if (willShow && !aiResponse) {
                ai.storyContinue(currentChapter.content, '继续读下去').then(setAIResponse);
              }
              return willShow;
            });
          }}
            className="flex-1 py-2 rounded-xl bg-purple-50 text-purple-600 text-kid-xs font-medium flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-colors">
            <span className="material-symbols-rounded text-base">{ai.loading ? 'hourglass_top' : 'auto_awesome'}</span>
            <span>{ai.loading ? '思考中...' : 'AI故事精灵'}</span>
          </button>
          <button onClick={() => setShowEduMode(true)}
            className="py-2 px-4 rounded-xl bg-kid-secondary/20 text-kid-primary text-kid-xs font-medium flex items-center gap-1.5 hover:bg-kid-secondary/30 transition-colors">
            <span className="material-symbols-rounded text-base">school</span>
            <span>幼教模式</span>
          </button>
        </div>

        {showAIChat && aiResponse && (
          <div className="mt-3 max-w-2xl mx-auto bg-purple-50/80 rounded-xl p-3 animate-fade-in-up">
            {aiResponse.error ? (
              <p className="text-kid-xs text-red-500">{aiResponse.error}</p>
            ) : (
              <>
                <p className="text-kid-xs text-kid-text leading-relaxed">{aiResponse.content}</p>
                <button onClick={() => { setShowAIChat(false); setAIResponse(null); }}
                  className="text-kid-xs text-kid-primary/60 mt-1.5 hover:underline">收起</button>
              </>
            )}
          </div>
        )}
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
