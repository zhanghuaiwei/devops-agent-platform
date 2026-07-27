/** AI 生成：JVM 指标接口——每次返回随机波动数据，配合前端 3s 轮询 */
import { NextResponse } from 'next/server';
import { genJvmMetrics } from '@/mocks/monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(genJvmMetrics());
}
