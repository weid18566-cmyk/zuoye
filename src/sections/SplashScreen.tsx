import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [titleIndex, setTitleIndex] = useState(0);
  const titleText = '童梦AI童话剧场';
  const subtitleText = '童心所至，故事新生';

  // 逐字显示动画
  useEffect(() => {
    if (titleIndex < titleText.length) {
      const timer = setTimeout(() => {
        setTitleIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [titleIndex]);

  const handleEnter = () => {
    setShow(false);
    setTimeout(onEnter, 400);
  };

  if (!show) {
    return (
      <div className="fixed inset-0 bg-kid-bg z-[9999] animate-fade-out pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 bg-kid-bg z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-48 gradient-top" />
      
      {/* 云朵装饰 */}
      <div className="absolute top-20 left-10 text-6xl opacity-40 animate-float-x">
        ☁️
      </div>
      <div className="absolute top-32 right-16 text-5xl opacity-30 animate-float-x animation-delay-500">
        ☁️
      </div>
      <div className="absolute bottom-40 left-20 text-4xl opacity-25 animate-float animation-delay-300">
        ☁️
      </div>
      <div className="absolute top-1/3 right-10 text-3xl opacity-20 animate-float animation-delay-700">
        ☁️
      </div>

      {/* 星星装饰 */}
      <div className="absolute top-28 left-1/4 text-2xl opacity-50 animate-pulse-soft">
        ✨
      </div>
      <div className="absolute top-40 right-1/3 text-xl opacity-40 animate-pulse-soft animation-delay-300">
        ✨
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center px-8">
        {/* 图标 */}
        <div className="text-8xl mb-8 animate-float">
          📚
        </div>

        {/* 标题 - 逐字显示 */}
        <h1 className="font-title text-kid-xl text-kid-text mb-4 text-center">
          {titleText.split('').map((char, i) => (
            <span
              key={i}
              className={`inline-block transition-all duration-300 ${
                i < titleIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* 副标题 */}
        <p 
          className={`font-body text-kid-sm text-kid-text/70 mb-12 transition-all duration-600 ${
            titleIndex >= titleText.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {subtitleText}
        </p>

        {/* 进入按钮 */}
        <button
          onClick={handleEnter}
          className={`btn-primary min-w-[200px] animate-pulse-soft transition-all duration-600 ${
            titleIndex >= titleText.length ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <span className="material-symbols-rounded text-2xl">rocket_launch</span>
          <span>开启童话之旅</span>
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-kid-border/30 to-transparent" />
      
      {/* 底部草地装饰 */}
      <div className="absolute bottom-4 flex gap-4 opacity-40">
        <span className="text-3xl animate-bounce-soft">🌱</span>
        <span className="text-3xl animate-bounce-soft animation-delay-200">🌿</span>
        <span className="text-3xl animate-bounce-soft animation-delay-400">🌱</span>
        <span className="text-3xl animate-bounce-soft animation-delay-600">🌿</span>
        <span className="text-3xl animate-bounce-soft animation-delay-300">🌱</span>
      </div>
    </div>
  );
}
