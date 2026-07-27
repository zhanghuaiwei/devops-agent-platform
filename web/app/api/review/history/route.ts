/** AI 生成：审查历史接口——按时间倒序返回 */
import { NextResponse } from 'next/server';
import { historyStore } from '@/mocks/review';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = [...historyStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json(items);
}
