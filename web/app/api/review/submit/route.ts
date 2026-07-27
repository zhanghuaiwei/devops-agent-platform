/** AI 生成：提交 PR 审查接口——校验 URL 后返回 mock 报告 */
import { NextResponse } from 'next/server';
import { buildReport } from '@/mocks/review';
import { sleep } from '@/mocks/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { prUrl?: string };
  try {
    body = (await req.json()) as { prUrl?: string };
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const prUrl = (body.prUrl ?? '').trim();
  if (!/^https:\/\/github\.com\/.+\/pull\/\d+/.test(prUrl)) {
    return NextResponse.json(
      { error: '请输入合法的 GitHub PR 链接（形如 https://github.com/owner/repo/pull/123）' },
      { status: 400 },
    );
  }
  // 模拟真实审查耗时，让前端加载态可感知
  await sleep(1500);
  return NextResponse.json(buildReport(prUrl));
}
