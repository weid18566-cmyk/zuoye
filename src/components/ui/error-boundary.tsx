import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-kid-bg flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-rounded text-5xl text-orange-500">error</span>
          </div>
          <h2 className="font-title text-kid-lg text-kid-text">出了点小问题</h2>
          <p className="text-kid-sm text-kid-text/50 max-w-xs">
            {this.state.error?.message || '页面遇到了意外错误，请刷新重试'}
          </p>
          <button onClick={this.handleReset} className="btn-primary">
            <span className="material-symbols-rounded">refresh</span>
            <span>重新加载</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
