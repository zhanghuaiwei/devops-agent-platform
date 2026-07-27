/** AI 生成：前端认证信息本地存储工具（login 写入，AuthGuard/AppShell 读取） */
import type { LoginResponse, User } from '@/types';

const TOKEN_KEY = 'devops_token';
const REFRESH_KEY = 'devops_refresh_token';
const USER_KEY = 'devops_user';

export function saveAuth(data: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: unknown; role?: unknown };
    // 手动校验结构，避免 localStorage 被篡改后直接崩溃
    if (typeof parsed.email === 'string' && typeof parsed.role === 'string') {
      return { email: parsed.email, role: parsed.role as User['role'] };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
