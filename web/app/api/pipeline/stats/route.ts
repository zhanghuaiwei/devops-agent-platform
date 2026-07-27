/** AI 生成：近 30 天构建失败率统计接口 */
import { NextResponse } from 'next/server';
import { statsStore } from '@/mocks/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(statsStore());
}
