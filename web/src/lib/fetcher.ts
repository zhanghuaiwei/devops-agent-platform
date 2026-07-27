/** AI 生成：SWR 通用 fetcher，统一把非 2xx 响应转成 Error，便于页面用 onError 处理 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    // 后端约定错误体为 { error: string }，解析失败时兜底为状态码文案
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `请求失败：${res.status}`);
  }
  return (await res.json()) as T;
}
