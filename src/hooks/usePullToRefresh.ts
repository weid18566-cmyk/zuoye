import { useState, useRef, useEffect, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  enabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, [enabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop > 0) { isPulling.current = false; setPullDistance(0); return; }

    const currentY = e.touches[0].clientY;
    const diff = Math.max(0, (currentY - startY.current) * 0.4);
    setPullDistance(Math.min(diff, maxPull));
  }, [isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try { await onRefresh(); } catch {}
      setPullDistance(0);
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    PullIndicator: pullDistance > 0 || isRefreshing ? (
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center transition-all duration-200"
        style={{ transform: `translate(-50%, ${pullDistance - 60}px)` }}
      >
        <div
          className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{ transform: `rotate(${Math.min(pullDistance / threshold * 360, 360)}deg)` }}
        >
          <span className="material-symbols-rounded text-kid-primary text-xl">
            {isRefreshing ? 'sync' : pullDistance >= threshold ? 'autorenew' : 'arrow_downward'}
          </span>
        </div>
      </div>
    ) : null,
  };
}
