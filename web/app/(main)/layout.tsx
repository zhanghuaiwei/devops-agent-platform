/** AI 生成：主功能区布局——登录守卫 + AppShell（仅作用于 app 路由组） */
import type { ReactNode } from 'react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
