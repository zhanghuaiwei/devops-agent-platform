/** AI 生成：mock 层通用工具 */

/** 模拟网络延迟，让加载态/流式效果可感知 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 用 globalThis 存放内存态 mock 数据。
 * 为什么不用模块级变量：Next.js 构建后每个 Route Handler 会打包成独立 chunk，
 * 模块级状态在不同路由间不共享；globalThis 才能保证登录失败计数、会话列表等
 * 在 /api/auth/login、/api/chat/sessions 等路由之间读写一致。
 */
export function getStore<T>(key: string, init: () => T): T {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!(key in g)) {
    g[key] = init();
  }
  return g[key] as T;
}

/** 生成短随机 id（mock 场景足够，避免引入 uuid 依赖） */
export function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
