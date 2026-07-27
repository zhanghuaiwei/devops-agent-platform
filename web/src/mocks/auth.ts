/** AI 生成：认证 mock 数据与令牌签发 */
import type { LoginResponse, Role, User } from '@/types';

export interface MockAccount {
  email: string;
  password: string;
  role: Role;
}

/** 三个内置 mock 账号，登录页提示卡片与 /api/auth/login 共用 */
export const MOCK_ACCOUNTS: MockAccount[] = [
  { email: 'admin@devops.local', password: 'admin123', role: 'ADMIN' },
  { email: 'dev@devops.local', password: 'dev123', role: 'DEVELOPER' },
  { email: 'viewer@devops.local', password: 'viewer123', role: 'VIEWER' },
];

export function verifyAccount(email: string, password: string): User | null {
  const hit = MOCK_ACCOUNTS.find(
    (a) => a.email === email.toLowerCase() && a.password === password,
  );
  return hit ? { email: hit.email, role: hit.role } : null;
}

/** 伪造 JWT 结构（header.payload.signature），仅用于演示，无真实签名 */
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.mock-signature`;
}

export function issueTokens(user: User): LoginResponse {
  const now = Math.floor(Date.now() / 1000);
  return {
    accessToken: fakeJwt({ sub: user.email, role: user.role, iat: now, exp: now + 2 * 3600 }),
    refreshToken: fakeJwt({ sub: user.email, type: 'refresh', iat: now, exp: now + 7 * 86400 }),
    expiresIn: 2 * 3600,
    refreshExpiresIn: 7 * 86400,
    user,
  };
}
