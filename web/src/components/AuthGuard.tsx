'use client';
/** AI 生成：登录守卫——未登录统一重定向 /login */
import { useEffect, useState, type ReactNode } from 'react';
import { getToken } from '@/lib/auth';

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 本组件同时服务 app 与 pages 双路由：next/navigation 与 next/router 互不通用，
    // 所以用 window.location 做跳转，是对两种路由都成立的最低公分母方案
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    setChecked(true);
  }, []);

  // 校验完成前不渲染业务内容，避免闪烁出受保护页面
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        正在校验登录状态…
      </div>
    );
  }
  return <>{children}</>;
}
