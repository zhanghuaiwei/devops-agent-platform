/** AI 生成：单个会话的重命名 / 归档 / 删除接口 */
import { NextResponse } from 'next/server';
import { deleteSession, updateSession } from '@/mocks/chat';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: Params) {
  let body: { title?: string; archived?: boolean };
  try {
    body = (await req.json()) as { title?: string; archived?: boolean };
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const patch: { title?: string; archived?: boolean } = {};
  if (typeof body.title === 'string' && body.title.trim()) patch.title = body.title.trim().slice(0, 30);
  if (typeof body.archived === 'boolean') patch.archived = body.archived;
  const updated = updateSession(params.id, patch);
  if (!updated) return NextResponse.json({ error: '会话不存在' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!deleteSession(params.id)) {
    return NextResponse.json({ error: '会话不存在' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
