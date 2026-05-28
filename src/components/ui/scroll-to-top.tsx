import { useState, useEffect, useCallback } from 'react';

interface ScrollToTopProps {
  threshold?: number;
  position?: 'bottom-right' | 'bottom-left';
}

export function ScrollToTop({ threshold = 300, position = 'bottom-right' }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  const positionClass = position === 'bottom-right' ? 'right-5 bottom-24' : 'left-5 bottom-24';

  return (
    <button
      onClick={handleClick}
      className={`fixed ${positionClass} z-40 w-12 h-12 rounded-full bg-kid-primary shadow-lg flex items-center justify-center animate-fade-in-scale hover:scale-110 active:scale-95 transition-transform`}
      aria-label="回到顶部"
    >
      <span className="material-symbols-rounded text-white text-xl">keyboard_arrow_up</span>
    </button>
  );
}
