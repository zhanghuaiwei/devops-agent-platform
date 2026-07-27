/** AI 生成：发送消息接口——意图分类 + 必要时创建会话，返回 sessionId 供流式接口使用 */
import { NextResponse } from 'next/server';
import { classifyIntent, createSession, INTENT_LABELS, sessionStore, updateSession } from '@/mocks/chat';
import { sleep } from '@/mocks/utils';

interface SendBody {
  sessionId?: string;
  message?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: SendBody;
  try {
    body = (await req.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const message = (body.message ?? '').trim();
  if (!message) {
    return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
  }
  await sleep(200);

  let sessionId = body.sessionId ?? '';
  const exists = sessionStore().sessions.some((s) => s.id === sessionId);
  if (!sessionId || !exists) {
    // 新会话：用首条消息前 16 个字当标题，贴近真实产品行为
    sessionId = createSession(message.slice(0, 16) || '新会话').id;
  } else {
    updateSession(sessionId, {}); // 仅刷新 updatedAt，让列表按活跃排序
  }

  const intent = classifyIntent(message);
  return NextResponse.json({ sessionId, intent, intentLabel: INTENT_LABELS[intent] });
}
