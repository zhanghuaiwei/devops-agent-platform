/** AI 生成：Pages Router 入口——全局 CSS 只能在这里为 pages 路由注入 */
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import 'highlight.js/styles/github.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
