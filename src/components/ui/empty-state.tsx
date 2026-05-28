interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: string };
  size?: 'small' | 'medium' | 'large';
}

export function EmptyState({ icon, title, description, action, size = 'medium' }: EmptyStateProps) {
  const iconSize = size === 'small' ? 'text-4xl' : size === 'large' ? 'text-7xl' : 'text-6xl';
  const containerPadding = size === 'small' ? 'py-8' : size === 'large' ? 'py-24' : 'py-16';

  return (
    <div className={`flex flex-col items-center justify-center ${containerPadding} px-5 text-center`}>
      <div className={`w-28 h-28 rounded-full bg-kid-border/30 flex items-center justify-center mb-6 ${size === 'small' ? 'w-20 h-20' : size === 'large' ? 'w-36 h-36' : ''}`}>
        <span className={`material-symbols-rounded ${iconSize} text-kid-text/25`}>
          {icon}
        </span>
      </div>
      <h3 className={`font-title text-kid-text/50 mb-2 ${size === 'small' ? 'text-kid-sm' : 'text-kid-md'}`}>
        {title}
      </h3>
      {description && (
        <p className="text-kid-sm text-kid-text/35 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary py-3 px-8 text-kid-sm">
          {action.icon && <span className="material-symbols-rounded text-lg">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}
