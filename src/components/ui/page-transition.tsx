import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <div 
      className="relative w-full h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ease-kid-out" 
      key={pageKey}
    >
      {children}
    </div>
  );
}
