import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail, validatePhone, validateUsername, validatePassword } from '@/lib/auth';
import type { UserRole } from '@/types';

export function RegisterPage() {
  const { register, setCurrentPage } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !phone.trim() || !password) {
      setError('请填写所有必填项');
      return;
    }
    if (!validateUsername(username.trim())) {
      setError('用户名格式不正确（2-20位字母、数字、中文、下划线）');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('邮箱格式不正确');
      return;
    }
    if (!validatePhone(phone.trim())) {
      setError('手机号格式不正确');
      return;
    }
    if (!validatePassword(password)) {
      setError('密码长度应为6-32位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');
    const result = await register(username.trim(), email.trim(), phone.trim(), password, role);
    setLoading(false);
    if (!result.success) {
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
          <h1 className="font-title text-kid-lg text-kid-text">注册账号</h1>
        </div>
      </header>

      <main className="flex-1 px-5 max-w-sm mx-auto w-full pb-8">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              用户名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2-20位字母、数字、中文、下划线"
              className="input-kid w-full"
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              邮箱 <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              className="input-kid w-full"
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              手机号 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入11位手机号"
              className="input-kid w-full"
              maxLength={11}
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              密码 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6-32位密码"
              className="input-kid w-full"
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              确认密码 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="input-kid w-full"
            />
          </div>

          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">
              角色
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'parent' as UserRole, label: '👨‍👩‍👧 家长', desc: '管理孩子、设置' },
                { value: 'child' as UserRole, label: '🧒 孩子', desc: '阅读故事' },
              ]).map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-4 rounded-kid-md border-2 transition-all text-left ${
                    role === r.value
                      ? 'border-kid-primary bg-kid-primary/5'
                      : 'border-kid-border hover:border-kid-primary/50'
                  }`}
                >
                  <p className="text-kid-sm font-medium text-kid-text">{r.label}</p>
                  <p className="text-kid-xs text-kid-text/60 mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-kid-xs bg-red-50 rounded-kid-md px-4 py-3 animate-fade-in-up">
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
                <span className="material-symbols-rounded">person_add</span>
                <span>注册</span>
              </>
            )}
          </button>

          <p className="text-center text-kid-xs text-kid-text/50 mt-4">
            注册即表示同意服务条款和隐私政策
          </p>
        </form>
      </main>
    </div>
  );
}
