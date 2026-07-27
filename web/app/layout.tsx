/** AI 生成：根布局——注入全局样式与代码高亮主题 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
// 全局 CSS 只能挂在根布局；highlight.js 主题供聊天页代码高亮使用
import 'highlight.js/styles/github.css';

export const metadata: Metadata = {
  title: 'DevOps Agent 智能运维平台',
  description: '代码审查、部署检查、故障诊断一体化的智能运维平台',
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
