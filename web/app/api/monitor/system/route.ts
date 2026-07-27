/** AI 生成：系统指标接口——CPU/内存/Agent 调用统计 */
import { NextResponse } from 'next/server';
import { genSystemMetrics } from '@/mocks/monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(genSystemMetrics());
}
