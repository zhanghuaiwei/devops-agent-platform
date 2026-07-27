/** AI 生成：登录页测试——错误密码时展示服务端返回的错误提示 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// @ 别名只映射到 src/，页面在 app/ 目录，用相对路径引入
import LoginPage from '../app/(auth)/login/page';

// 页面用 next/navigation 的 useRouter 跳转，测试环境没有路由上下文，直接 mock 掉
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('登录页', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('密码错误时展示「邮箱或密码错误」提示', async () => {
    // mock fetch 返回 401，模拟后端拒绝
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: '邮箱或密码错误（剩余尝试次数 4）' }),
      } as unknown as Response),
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'admin@devops.local' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrong-password' } });
    // 页面上有「登录 Tab」和「登录提交按钮」两个同名按钮,取最后一个(表单提交按钮)
    fireEvent.click(screen.getAllByRole('button', { name: '登录' }).at(-1)!);

    // 服务端文案带剩余次数后缀，用正则做前缀匹配
    expect(await screen.findByRole('alert')).toHaveTextContent(/邮箱或密码错误/);
  });

  it('邮箱格式非法时前端直接拦截，不发请求', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'admin123' } });
    // 同上:取同名按钮中的提交按钮
    fireEvent.click(screen.getAllByRole('button', { name: '登录' }).at(-1)!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('请输入合法的邮箱地址');
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
