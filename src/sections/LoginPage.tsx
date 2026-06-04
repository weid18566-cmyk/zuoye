import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login, setCurrentPage } = useAuth();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(account.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
    // success will auto-redirect via App
  };

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <h1 className="font-title text-kid-xl text-kid-primary text-center">
          童梦AI童话剧场
        </h1>
        <p className="text-kid-sm text-kid-text/60 text-center mt-2">
          欢迎回来，请登录您的账号
        </p>
      </header>

      <main className="flex-1 px-5 flex flex-col justify-center max-w-sm mx-auto w-full pb-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              账号（用户名/邮箱/手机号）
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入用户名、邮箱或手机号"
              className="input-kid w-full"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input-kid w-full pr-14"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kid-text/40 hover:text-kid-text"
              >
                <span className="material-symbols-rounded">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-kid-xs bg-red-50 rounded-kid-md px-4 py-3 animate-fade-in-up" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? (
              <span className="loading-spinner w-6 h-6" />
            ) : (
              <>
                <span className="material-symbols-rounded">login</span>
                <span>登录</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage('forgotPassword')}
            className="text-kid-sm text-kid-primary hover:underline"
          >
            忘记密码？
          </button>
          <button
            onClick={() => setCurrentPage('register')}
            className="text-kid-sm text-kid-primary hover:underline"
          >
            注册新账号
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentPage('splash')}
            className="btn-icon mx-auto"
          >
            <span className="material-symbols-rounded text-kid-text/50">home</span>
          </button>
        </div>
      </main>
    </div>
  );
}
