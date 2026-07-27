/** AI 生成：会话列表（分页）与新建会话接口 */
import { NextResponse } from 'next/server';
import { createSession, sessionStore } from '@/mocks/chat';
import type { SessionListResponse } from '@/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const archived = searchParams.get('archived') === '1';
  const all = sessionStore()
    .sessions.filter((s) => s.archived === archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const items = all.slice(0, page * PAGE_SIZE); // 累计切片，前端「加载更多」直接替换整表
  const body: SessionListResponse = { items, hasMore: all.length > items.length, total: all.length };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  let title = '新会话';
  try {
    const body = (await req.json()) as { title?: string };
    if (body.title?.trim()) title = body.title.trim().slice(0, 30);
  } catch {
    // 空请求体也允许，直接用默认标题
  }
  return NextResponse.json(createSession(title), { status: 201 });
}
