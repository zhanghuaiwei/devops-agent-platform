/** AI 生成：最近 10 次构建列表接口 */
import { NextResponse } from 'next/server';
import { runsStore } from '@/mocks/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(runsStore().slice(0, 10));
}
