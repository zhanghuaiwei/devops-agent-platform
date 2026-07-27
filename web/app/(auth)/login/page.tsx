'use client';
/** AI 生成：登录/注册页——双 Tab、表单校验、mock 账号提示卡、登录成功跳转 /chat */
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Loader2, ServerCog } from 'lucide-react';
import { saveAuth, getToken } from '@/lib/auth';
import type { LoginResponse, Role } from '@/types';

type Tab = 'login' | 'register';

const MOCK_ACCOUNTS: Array<{ email: string; password: string; role: Role; label: string }> = [
  { email: 'admin@devops.local', password: 'admin123', role: 'ADMIN', label: '管理员' },
  { email: 'dev@devops.local', password: 'dev123', role: 'DEVELOPER', label: '开发者' },
  { email: 'viewer@devops.local', password: 'viewer123', role: 'VIEWER', label: '只读用户' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录用户直接进 Chat，避免重复登录
  useEffect(() => {
    if (getToken()) router.replace('/chat');
  }, [router]);

  const validate = (): string => {
    if (!EMAIL_RE.test(email)) return '请输入合法的邮箱地址';
    if (password.length < 6) return '密码长度至少 6 位';
    if (tab === 'register' && password !== confirm) return '两次输入的密码不一致';
    return '';
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setLoading(true);
    try {
      if (tab === 'register') {
        // 后端注册接口未就绪：mock 注册仅做前端校验并提示，不落库
        await new Promise((r) => setTimeout(r, 500));
        setNotice('注册成功（mock 环境不持久化），请使用下方 mock 账号登录');
        setTab('login');
        return;
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as Partial<LoginResponse> & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `登录失败（${res.status}）`);
        return;
      }
      saveAuth(data as LoginResponse);
      router.push('/chat');
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ServerCog size={30} />
          </div>
          <h1 className="text-2xl font-bold text-white">DevOps Agent 智能运维平台</h1>
          <p className="mt-1 text-sm text-slate-400">代码审查 · 部署检查 · 故障诊断</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setNotice('');
                }}
                className={clsx(
                  'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                  tab === t ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          {/* noValidate:禁用浏览器原生校验,统一走自定义校验逻辑(错误样式一致、可测试) */}
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-600">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-600">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {tab === 'register' && (
              <div>
                <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-600">
                  确认密码
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{notice}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {tab === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>

        {/* mock 账号提示卡片 */}
        <div className="rounded-2xl bg-slate-800/80 p-4 text-sm">
          <div className="mb-2 font-medium text-slate-300">Mock 账号（点击填充）</div>
          <div className="space-y-1.5">
            {MOCK_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                onClick={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                  setTab('login');
                }}
                className="flex w-full items-center justify-between rounded-lg bg-slate-700/60 px-3 py-2 text-left text-slate-300 hover:bg-slate-700"
              >
                <span>
                  {a.email} <span className="text-slate-500">/ {a.password}</span>
                </span>
                <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs">{a.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">连续 5 次密码错误将触发 429 临时锁定（mock 演示）</p>
        </div>
      </div>
    </div>
  );
}
