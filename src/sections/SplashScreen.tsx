import { useEffect, useState, useCallback, useRef } from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [titleIndex, setTitleIndex] = useState(0);
  const [buttonPressed, setButtonPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleText = '童梦AI童话剧场';
  const subtitleText = '童心所至，故事新生';

  useEffect(() => {
    if (titleIndex < titleText.length) {
      const timer = setTimeout(() => {
        setTitleIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [titleIndex]);

  // 随机粒子效果
  useEffect(() => {
    if (titleIndex >= titleText.length && containerRef.current) {
      const container = containerRef.current;
      const interval = setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${20 + Math.random() * 60}%`;
        particle.style.top = `${30 + Math.random() * 40}%`;
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
        particle.style.setProperty('--dy', `${-40 - Math.random() * 80}px`);
        particle.style.background = `hsl(${120 + Math.random() * 40}, ${50 + Math.random() * 30}%, ${50 + Math.random() * 30}%)`;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 2200);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [titleIndex]);

  const handleEnter = useCallback(() => {
    setShow(false);
    setTimeout(onEnter, 400);
  }, [onEnter]);

  if (!show) {
    return (
      <div className="fixed inset-0 bg-kid-bg z-[9999] animate-fade-out pointer-events-none" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-kid-bg z-[9999] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-kid-primary/5 animate-float-slow" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-kid-secondary/10 animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-kid-primary/5 via-transparent to-kid-secondary/5 animate-pulse-soft" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-48 gradient-top" />

      <div className="absolute top-20 left-10 text-6xl opacity-40 animate-float-x-slow">
        ☁️
      </div>
      <div className="absolute top-32 right-16 text-5xl opacity-30 animate-float-x-slow" style={{ animationDelay: '3s' }}>
        ☁️
      </div>
      <div className="absolute bottom-40 left-20 text-4xl opacity-25 animate-float-slow" style={{ animationDelay: '1s' }}>
        ☁️
      </div>
      <div className="absolute top-1/3 right-10 text-3xl opacity-20 animate-float-slow" style={{ animationDelay: '2.5s' }}>
        ☁️
      </div>

      <div className="absolute top-28 left-1/4 text-2xl opacity-50 animate-pulse-soft">
        ✨
      </div>
      <div className="absolute top-40 right-1/3 text-xl opacity-40 animate-pulse-soft" style={{ animationDelay: '1.5s' }}>
        ✨
      </div>
      <div className="absolute bottom-1/4 left-3/4 text-lg opacity-30 animate-pulse-soft" style={{ animationDelay: '0.8s' }}>
        ✨
      </div>

      <div className="relative z-10 flex flex-col items-center px-8">
        <div className={`text-8xl mb-8 transition-all duration-700 ${
          titleIndex >= titleText.length ? 'animate-float' : 'opacity-50 scale-75'
        }`}>
          📚
        </div>

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

        <p
          className={`font-body text-kid-sm text-kid-text/70 mb-12 transition-all duration-600 ${
            titleIndex >= titleText.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {subtitleText}
        </p>

        <button
          onClick={handleEnter}
          onMouseDown={() => setButtonPressed(true)}
          onMouseUp={() => setButtonPressed(false)}
          onTouchStart={() => setButtonPressed(true)}
          onTouchEnd={() => setButtonPressed(false)}
          className={`btn-primary min-w-[200px] touch-ripple transition-all duration-600 ${
            titleIndex >= titleText.length ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          } ${buttonPressed ? 'scale-95' : titleIndex >= titleText.length ? 'animate-pulse-soft' : ''}`}
          style={{ transitionDelay: '300ms' }}
        >
          <span className="material-symbols-rounded text-2xl">rocket_launch</span>
          <span>开启童话之旅</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-kid-border/30 to-transparent" />

      <div className="absolute bottom-4 flex gap-4 opacity-40">
        {['🌱', '🌿', '🌱', '🌿', '🌱'].map((e, i) => (
          <span
            key={i}
            className="text-3xl animate-bounce-soft"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}
