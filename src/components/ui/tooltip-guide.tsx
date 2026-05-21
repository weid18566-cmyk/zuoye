import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { OnboardingStepData } from '@/hooks/useOnboarding';

interface TooltipGuideProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  show?: boolean;
  onClose?: () => void;
  highlight?: boolean;
  icon?: string;
}

export function TooltipGuide({
  content,
  title,
  position = 'bottom',
  children,
  show: controlledShow,
  onClose,
  highlight = false,
  icon,
}: TooltipGuideProps) {
  const [internalShow, setInternalShow] = useState(false);
  const show = controlledShow !== undefined ? controlledShow : internalShow;
  const triggerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const hovering = useRef(false);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const offset = 12;
      const styles: Record<string, React.CSSProperties> = {
        top: {
          bottom: window.innerHeight - rect.top + offset,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        },
        bottom: {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        },
        left: {
          right: window.innerWidth - rect.left + offset,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)',
        },
        right: {
          left: rect.right + offset,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)',
        },
      };
      setTooltipStyle(styles[position]);
      setArrowStyle(getArrowStyle(position));
    }
  }, [show, position]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      style={highlight && show ? { boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 0 8px rgba(99, 102, 241, 0.1)', borderRadius: 12, zIndex: 9999 } : {}}
      onMouseEnter={() => {
        if (controlledShow === undefined) {
          hovering.current = true;
          setInternalShow(true);
        }
      }}
      onMouseLeave={() => {
        if (controlledShow === undefined) {
          hovering.current = false;
          setTimeout(() => {
            if (!hovering.current) setInternalShow(false);
          }, 200);
        }
      }}
    >
      {children}
      {show && (
        <div
          className={`fixed z-[9999] animate-fade-in-up pointer-events-auto`}
          style={tooltipStyle}
          onMouseEnter={() => { hovering.current = true; }}
          onMouseLeave={() => {
            hovering.current = false;
            if (controlledShow === undefined) setInternalShow(false);
          }}
        >
          <div className="bg-white rounded-kid-lg shadow-kid-lg p-4 max-w-[280px] border border-kid-border">
            {title && (
              <div className="flex items-center gap-2 mb-2">
                {icon && <span className="material-symbols-rounded text-kid-primary text-xl">{icon}</span>}
                <h4 className="font-title text-kid-sm text-kid-text">{title}</h4>
              </div>
            )}
            <p className="text-kid-xs text-kid-text/70 leading-relaxed">{content}</p>
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="mt-3 w-full py-2 rounded-kid-md bg-kid-primary text-white text-kid-xs font-medium hover:opacity-90 transition-opacity"
              >
                知道了
              </button>
            )}
          </div>
          <div
            className="absolute w-3 h-3 bg-white border border-kid-border rotate-45"
            style={arrowStyle}
          />
        </div>
      )}
    </div>
  );
}

function getArrowStyle(position: string): React.CSSProperties {
  switch (position) {
    case 'top':
      return { bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderTop: 'none', borderLeft: 'none' };
    case 'bottom':
      return { top: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderBottom: 'none', borderRight: 'none' };
    case 'left':
      return { right: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderTop: 'none', borderRight: 'none' };
    case 'right':
      return { left: -6, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderBottom: 'none', borderLeft: 'none' };
    default:
      return {};
  }
}

export function GuideOverlay({
  show,
  onClose,
  steps,
  currentStep,
  onNext,
  onPrev,
}: {
  show: boolean;
  onClose: () => void;
  steps: OnboardingStepData[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  if (!show) return null;

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-kid-xl p-8 max-w-sm w-[90%] shadow-kid-lg text-center animate-slide-in-up">
        <div className="w-20 h-20 rounded-full bg-kid-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-rounded text-4xl text-kid-primary">
            {step.icon || 'auto_awesome'}
          </span>
        </div>
        <h3 className="font-title text-kid-lg text-kid-text mb-2">{step.title}</h3>
        <p className="text-kid-sm text-kid-text/60 mb-6 leading-relaxed">{step.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="text-kid-sm text-kid-text/40 disabled:opacity-0 hover:text-kid-primary transition-colors"
          >
            上一步
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'bg-kid-primary w-4' : 'bg-kid-border'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button onClick={onNext} className="text-kid-sm text-kid-primary font-medium">
              下一步
            </button>
          ) : (
            <button onClick={onClose} className="btn-primary py-2 px-6">
              <span className="material-symbols-rounded">check</span>
              <span>开始使用</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
