import { type ReactNode, useState, useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [currentPage, setCurrentPage] = useState(pageKey);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPage = useRef(pageKey);

  useEffect(() => {
    if (pageKey !== prevPage.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentPage(pageKey);
        setCurrentChildren(children);
        setIsAnimating(false);
        prevPage.current = pageKey;
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setCurrentChildren(children);
    }
  }, [pageKey, children]);

  return (
    <div className="relative overflow-hidden">
      <div
        key={currentPage}
        className={isAnimating ? 'page-enter' : ''}
        style={isAnimating ? {} : {}}
      >
        {currentChildren}
      </div>
    </div>
  );
}
