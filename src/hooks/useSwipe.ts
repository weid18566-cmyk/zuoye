import { useRef, useEffect, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
}

interface UseSwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  enabled?: boolean;
}

export function useSwipe(
  targetRef: React.RefObject<HTMLElement | null>,
  handlers: SwipeHandlers,
  options: UseSwipeOptions = {}
) {
  const { threshold = 50, velocityThreshold = 0.3, enabled = true } = options;
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const start = startRef.current;
    if (!start) return;
    startRef.current = null;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const velocityX = absDx / dt;
    const velocityY = absDy / dt;

    if (absDx < 5 && absDy < 5 && dt < 300) {
      handlersRef.current.onTap?.();
      return;
    }

    if (absDx > absDy) {
      if (absDx >= threshold || velocityX >= velocityThreshold) {
        if (dx > 0) handlersRef.current.onSwipeRight?.();
        else handlersRef.current.onSwipeLeft?.();
      }
    } else {
      if (absDy >= threshold || velocityY >= velocityThreshold) {
        if (dy > 0) handlersRef.current.onSwipeDown?.();
        else handlersRef.current.onSwipeUp?.();
      }
    }
  }, [threshold, velocityThreshold]);

  useEffect(() => {
    if (!enabled) return;
    const el = targetRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, targetRef, handleTouchStart, handleTouchEnd]);
}
