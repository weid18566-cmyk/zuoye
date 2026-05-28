import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <div className="relative overflow-hidden" key={pageKey}>
      <div className="page-enter">
        {children}
      </div>
    </div>
  );
}
