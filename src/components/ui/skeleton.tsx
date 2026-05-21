interface SkeletonProps {
  className?: string;
  count?: number;
  variant?: 'card' | 'text' | 'circle' | 'list';
}

export function Skeleton({ className = '', count = 1, variant = 'card' }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white rounded-kid-lg p-4 shadow-kid">
            <div className="skeleton w-full aspect-square rounded-kid-md mb-3" />
            <div className="skeleton h-5 w-3/4 rounded mb-2" />
            <div className="skeleton h-3 w-full rounded mb-2" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white rounded-kid-lg p-4 shadow-kid flex gap-4">
            <div className="skeleton w-24 h-24 rounded-kid-md flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-5 w-2/3 rounded mb-2" />
              <div className="skeleton h-3 w-full rounded mb-2" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((i) => (
          <div key={i} className="skeleton h-4 w-full rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((i) => (
          <div key={i} className="skeleton w-12 h-12 rounded-full" />
        ))}
      </div>
    );
  }

  return null;
}

export function StorySkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' | 'compact' }) {
  if (viewMode === 'list') {
    return <Skeleton count={4} variant="list" />;
  }
  if (viewMode === 'compact') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-white rounded-kid-lg overflow-hidden shadow-kid">
            <div className="skeleton w-full h-28" />
            <div className="p-2">
              <div className="skeleton h-4 w-3/4 rounded mb-1" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <Skeleton count={4} variant="card" />;
}
