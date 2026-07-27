/** AI 生成：流式回答接口——用 ReadableStream 模拟 SSE，逐步骤 + 逐 token 推送 */
import type { Intent } from '@/types';
import { getScript, INTENT_LABELS } from '@/mocks/chat';
import { sleep } from '@/mocks/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const intentParam = searchParams.get('intent') ?? 'general';
  const intent: Intent = (
    ['code_review', 'deploy', 'diagnose', 'general'] as Intent[]
  ).includes(intentParam as Intent)
    ? (intentParam as Intent)
    : 'general';
  const script = getScript(intent);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      try {
        send('meta', { intent: script.intent, intentLabel: INTENT_LABELS[script.intent] });
        // 先推 Agent 推理步骤，让前端逐步渲染 thought/action/observation 卡片
        for (const step of script.steps) {
          await sleep(450);
          send(step.type, step);
        }
        // 再逐字推最终回答，模拟大模型 token 输出
        for (const ch of script.answer) {
          await sleep(16);
          send('token', { text: ch });
        }
        send('done', {});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
