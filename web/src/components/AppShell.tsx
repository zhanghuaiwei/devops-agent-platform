'use client';
/**
 * AI 生成：整体布局壳——深色侧边栏 + 顶栏 + 浅色内容区。
 * 同时被 app/(main)/layout.tsx（App Router）与 pages/dashboard.tsx、pages/pipeline.tsx
 * （Pages Router）引用。这是双路由混合的已知妥协：usePathname(app) 与 useRouter(pages)
 * 互不兼容，因此导航激活态在挂载后读取 window.location.pathname 判断，两种路由下都成立。
 */
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  FileSearch,
  Gauge,
  GitBranch,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import type { Role } from '@/types';

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/review', label: '代码审查', icon: FileSearch },
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
];

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: '管理员', className: 'bg-red-100 text-red-700' },
  DEVELOPER: { label: '开发者', className: 'bg-blue-100 text-blue-700' },
  VIEWER: { label: '只读用户', className: 'bg-slate-200 text-slate-600' },
};

export default function AppShell({ children }: Props) {
  const [path, setPath] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('VIEWER');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPath(window.location.pathname);
    const user = getUser();
    if (user) {
      setEmail(user.email);
      setRole(user.role);
    }
  }, []);

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.VIEWER;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white',
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 桌面端侧边栏 */}
      <aside className="hidden w-56 flex-col bg-slate-900 md:flex">
        <div className="px-5 py-4 text-lg font-bold text-white">DevOps Agent</div>
        {nav}
        <div className="p-4 text-xs text-slate-500">智能运维平台 v0.1</div>
      </aside>

      {/* 移动端抽屉 */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-56 flex-col bg-slate-900">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-lg font-bold text-white">DevOps Agent</span>
              <button onClick={() => setMenuOpen(false)} className="text-slate-400" aria-label="关闭菜单">
                <X size={20} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <button
            className="text-slate-500 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="打开菜单"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <span className="hidden text-sm text-slate-600 sm:inline">{email}</span>
          <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.className)}>
            {badge.label}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
