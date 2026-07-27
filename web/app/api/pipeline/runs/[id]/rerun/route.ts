/** AI 生成：重新运行接口——把目标构建重置为 running 并置顶返回 */
import { NextResponse } from 'next/server';
import { rerun } from '@/mocks/pipeline';
import { sleep } from '@/mocks/utils';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await sleep(300);
  const run = rerun(params.id);
  if (!run) return NextResponse.json({ error: '构建不存在' }, { status: 404 });
  return NextResponse.json(run);
}
