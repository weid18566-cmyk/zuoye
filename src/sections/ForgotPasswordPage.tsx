import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, setCurrentPage } = useAuth();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    setLoading(true);
    setError('');
    const result = await forgotPassword(email.trim());
    setLoading(false);
    if (result.success) {
      setMessage(result.message);
      setStep('reset');
    } else {
      setError(result.message);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode || !newPassword) {
      setError('请填写验证码和新密码');
      return;
    }
    setLoading(true);
    setError('');
    const result = await resetPassword(email, newPassword, verifyCode);
    setLoading(false);
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => setCurrentPage('login'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentPage('login')} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <h1 className="font-title text-kid-lg text-kid-text">找回密码</h1>
        </div>
      </header>

      <main className="flex-1 px-5 max-w-sm mx-auto w-full pt-4">
        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div className="bg-white rounded-kid-lg p-6 shadow-kid space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <span className="material-symbols-rounded text-3xl text-orange-500">lock_reset</span>
              </div>
              <p className="text-kid-sm text-kid-text/60 text-center">
                请输入注册时使用的邮箱，我们将发送验证码
              </p>

              <div>
                <label className="block text-kid-sm text-kid-text font-medium mb-2">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="input-kid w-full"
                />
              </div>

              {error && (
                <p className="text-red-500 text-kid-xs bg-red-50 rounded-kid-md px-4 py-3">{error}</p>
              )}
              {message && (
                <p className="text-kid-primary text-kid-xs bg-kid-primary/10 rounded-kid-md px-4 py-3">{message}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? (
                <span className="loading-spinner w-6 h-6" />
              ) : (
                <>
                  <span className="material-symbols-rounded">send</span>
                  <span>发送验证码</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="bg-white rounded-kid-lg p-6 shadow-kid space-y-4">
              <p className="text-kid-xs text-kid-primary/60 text-center">
                验证码已发送至 {email}
              </p>

              <div>
                <label className="block text-kid-sm text-kid-text font-medium mb-2">验证码</label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className="input-kid w-full"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-kid-sm text-kid-text font-medium mb-2">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6-32位新密码"
                  className="input-kid w-full"
                />
              </div>

              {error && (
                <p className="text-red-500 text-kid-xs bg-red-50 rounded-kid-md px-4 py-3">{error}</p>
              )}
              {message && (
                <p className="text-kid-primary text-kid-xs bg-kid-primary/10 rounded-kid-md px-4 py-3">{message}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? (
                <span className="loading-spinner w-6 h-6" />
              ) : (
                <>
                  <span className="material-symbols-rounded">check</span>
                  <span>重置密码</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
