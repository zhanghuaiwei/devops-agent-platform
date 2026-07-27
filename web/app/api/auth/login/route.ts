/** AI 生成：登录接口——校验 mock 账号、签发 mock JWT、连续失败 5 次返回 429 */
import { NextResponse } from 'next/server';
import { issueTokens, verifyAccount } from '@/mocks/auth';
import { getStore, sleep } from '@/mocks/utils';

interface LoginBody {
  email?: string;
  password?: string;
}

const MAX_FAILS = 5;

export async function POST(req: Request) {
  await sleep(300); // 模拟网络延迟，让登录按钮 loading 态可见
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';

  // 失败计数必须放 globalThis（见 mocks/utils 注释），否则锁定期跨请求失效
  const fails = getStore<Record<string, number>>('devops_login_fails', () => ({}));
  if ((fails[email] ?? 0) >= MAX_FAILS) {
    return NextResponse.json(
      { error: '连续失败次数过多，账号已临时锁定，请稍后再试' },
      { status: 429 },
    );
  }

  const user = verifyAccount(email, password);
  if (!user) {
    fails[email] = (fails[email] ?? 0) + 1;
    const left = MAX_FAILS - fails[email];
    if (left <= 0) {
      return NextResponse.json({ error: '连续失败 5 次，账号已临时锁定' }, { status: 429 });
    }
    return NextResponse.json(
      { error: `邮箱或密码错误（剩余尝试次数 ${left}）` },
      { status: 401 },
    );
  }

  fails[email] = 0; // 登录成功清零计数
  return NextResponse.json(issueTokens(user));
}
