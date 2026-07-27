/** AI 生成：fetcher 测试——非 2xx 响应必须抛异常，2xx 返回解析后的 JSON */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from '@/lib/fetcher';

describe('fetcher', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('响应非 2xx 时抛出包含服务端 error 的异常', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: '服务器开小差了' }),
      } as unknown as Response),
    );
    await expect(fetcher('/api/whatever')).rejects.toThrow('服务器开小差了');
  });

  it('错误体不是预期结构时兜底为状态码文案', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => null,
      } as unknown as Response),
    );
    await expect(fetcher('/api/whatever')).rejects.toThrow('请求失败：502');
  });

  it('响应 2xx 时返回解析后的 JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ hello: 'world' }),
      } as unknown as Response),
    );
    await expect(fetcher<{ hello: string }>('/api/whatever')).resolves.toEqual({ hello: 'world' });
  });
});
