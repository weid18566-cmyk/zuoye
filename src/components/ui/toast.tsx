import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { ToastMessage } from '@/types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (content: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const addToast = useCallback(
    (content: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
      const id = `toast-${++toastId}`;
      setToasts(prev => [...prev, { id, content, type, duration }]);
      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[10000] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast, index) => {
          const iconMap: Record<string, string> = {
            success: 'check_circle',
            error: 'error',
            info: 'info',
            warning: 'warning',
          };
          const colorMap: Record<string, string> = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-kid-primary',
            warning: 'bg-orange-500',
          };
          return (
            <div
              key={toast.id}
              className={`${colorMap[toast.type]} text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up pointer-events-auto cursor-pointer`}
              style={{
                opacity: index === 0 ? 1 : 1 - index * 0.15,
                transform: `translateY(${-index * 8}px) scale(${1 - index * 0.05})`,
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span className="material-symbols-rounded text-lg">
                {iconMap[toast.type]}
              </span>
              <span className="text-kid-sm whitespace-nowrap">{toast.content}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
