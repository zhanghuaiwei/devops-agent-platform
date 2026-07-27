'use client';
/**
 * AI 生成：Chat 核心页。
 * 交互链路：输入 → POST /api/chat/send（意图分类）→ GET /api/chat/stream（SSE 流式）→
 * 逐步渲染 thought/action/observation 卡片，token 事件逐字打出最终回答。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  Archive,
  ArchiveRestore,
  Bot,
  Download,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import StepCard from '@/components/chat/StepCard';
import type { AgentStep, ChatMessage, ChatSession, Intent, SessionListResponse } from '@/types';

const INTENT_BADGE: Record<Intent, { label: string; className: string }> = {
  code_review: { label: '代码审查', className: 'bg-violet-100 text-violet-700' },
  deploy: { label: '部署检查', className: 'bg-emerald-100 text-emerald-700' },
  diagnose: { label: '故障诊断', className: 'bg-red-100 text-red-700' },
  general: { label: '通用助手', className: 'bg-slate-200 text-slate-600' },
};

const QUICK_PROMPTS = [
  { label: '审查 PR', text: '请帮我审查这个 PR：https://github.com/devops/platform/pull/128' },
  { label: '检查部署', text: '检查一下 main 分支最近一次部署到生产的状态是否正常' },
  { label: '诊断故障', text: '线上订单服务从 10 点开始出现大量 502，帮我诊断一下故障原因' },
  { label: '查看日志', text: '查看 order-service 最近 1 小时的错误日志并汇总 Top 异常' },
];

/** 生成前端消息 id（会话内唯一即可） */
function uid(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatPage() {
  // ---------- 会话列表状态 ----------
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // ---------- 聊天状态 ----------
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useMemo<ChatMessage[]>(
    () => (activeId ? messagesBySession[activeId] ?? [] : []),
    [activeId, messagesBySession],
  );

  // 当前 Agent 徽标取最后一条助手消息的意图
  const currentIntent = useMemo<Intent | null>(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant' && messages[i].intent) return messages[i].intent!;
    }
    return null;
  }, [messages]);

  // ---------- 会话列表加载（累计分页：page 增大时接口返回前 N*10 条，整体替换） ----------
  const loadSessions = useCallback(async (p: number, archived: boolean) => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions?page=${p}&archived=${archived ? 1 : 0}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SessionListResponse;
      setSessions(data.items);
      setHasMore(data.hasMore);
      setPage(p);
    } catch {
      setError('会话列表加载失败');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(1, showArchived);
  }, [showArchived, loadSessions]);

  // 消息变化时滚动到底部，流式输出时保持可见
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  /** 给指定助手消息追加一个推理步骤（不可变更新，触发 React 重渲染） */
  const appendStep = useCallback((sessionId: string, messageId: string, step: AgentStep) => {
    setMessagesBySession((prev) => ({
      ...prev,
      [sessionId]: (prev[sessionId] ?? []).map((m) =>
        m.id === messageId ? { ...m, steps: [...(m.steps ?? []), step] } : m,
      ),
    }));
  }, []);

  // ---------- 发送 + 流式消费 ----------
  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setError('');
    setStreaming(true);

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeId ?? undefined, message: text }),
      });
      if (!res.ok) throw new Error('send');
      const meta = (await res.json()) as { sessionId: string; intent: Intent; intentLabel: string };
      const sid = meta.sessionId;

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '',
        steps: [],
        intent: meta.intent,
        createdAt: new Date().toISOString(),
      };

      // 先乐观落两条消息，再开始消费流
      setActiveId(sid);
      setMessagesBySession((prev) => ({
        ...prev,
        [sid]: [...(prev[sid] ?? []), userMsg, assistantMsg],
      }));
      setInput('');

      const sr = await fetch(`/api/chat/stream?sessionId=${sid}&intent=${meta.intent}`);
      if (!sr.ok || !sr.body) throw new Error('stream');
      const reader = sr.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // SSE 手动解析：以 \n\n 分帧，帧内 event/data 两行；buffer 兜底跨 chunk 的半帧
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx = buffer.indexOf('\n\n');
        while (idx >= 0) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          let event = 'message';
          let dataStr = '';
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
          }
          if (dataStr) {
            const data = JSON.parse(dataStr) as Record<string, unknown>;
            if (event === 'thought' || event === 'action' || event === 'observation') {
              appendStep(sid, assistantMsg.id, data as unknown as AgentStep);
            } else if (event === 'token') {
              // 逐字追加：用函数式 setState 保证拿到最新 content
              setMessagesBySession((prev) => ({
                ...prev,
                [sid]: (prev[sid] ?? []).map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: m.content + String(data.text ?? '') } : m,
                ),
              }));
            }
          }
          idx = buffer.indexOf('\n\n');
        }
      }
      // 会话标题/排序已在服务端更新，静默刷新列表
      loadSessions(page, showArchived);
    } catch {
      setError('消息发送失败，请重试');
    } finally {
      setStreaming(false);
    }
  };

  // ---------- 会话操作 ----------
  const renameSession = async (s: ChatSession) => {
    const title = window.prompt('重命名会话', s.title);
    if (!title?.trim()) return;
    await fetch(`/api/chat/sessions/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    });
    loadSessions(page, showArchived);
  };

  const toggleArchive = async (s: ChatSession) => {
    await fetch(`/api/chat/sessions/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !s.archived }),
    });
    loadSessions(page, showArchived);
  };

  const removeSession = async (s: ChatSession) => {
    if (!window.confirm(`确定删除会话「${s.title}」吗？`)) return;
    await fetch(`/api/chat/sessions/${s.id}`, { method: 'DELETE' });
    if (activeId === s.id) setActiveId(null);
    loadSessions(page, showArchived);
  };

  // ---------- 导出 Markdown ----------
  const exportMarkdown = () => {
    if (messages.length === 0) return;
    const session = sessions.find((s) => s.id === activeId);
    const lines: string[] = [`# ${session?.title ?? '未命名会话'}`, ''];
    for (const m of messages) {
      lines.push(m.role === 'user' ? '## 用户' : '## 助手', '');
      if (m.steps?.length) {
        for (const step of m.steps) {
          if (step.type === 'thought') lines.push(`> 思考：${step.content ?? ''}`);
          else if (step.type === 'action')
            lines.push(`> 工具调用：${step.tool ?? ''} \`${JSON.stringify(step.params ?? {})}\``);
          else lines.push(`> 观察：${step.summary ?? ''}`);
        }
        lines.push('');
      }
      if (m.content) lines.push(m.content, '');
    }
    // Blob + URL.createObjectURL 是浏览器端纯前端下载文件的标准做法
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session?.title ?? '会话'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const badge = currentIntent ? INTENT_BADGE[currentIntent] : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ---------- 左侧会话列表 ---------- */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex gap-2 border-b border-slate-100 p-3">
          <button
            onClick={() => {
              setActiveId(null);
              setError('');
            }}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            新建会话
          </button>
          <button
            onClick={exportMarkdown}
            disabled={messages.length === 0}
            title="导出当前会话为 Markdown"
            className="rounded-lg border border-slate-300 px-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <Download size={16} />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          {[
            { key: false, label: '进行中' },
            { key: true, label: '已归档' },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => setShowArchived(t.key)}
              className={clsx(
                'flex-1 py-2 text-sm',
                showArchived === t.key
                  ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={clsx(
                'group cursor-pointer border-b border-slate-50 px-3 py-2.5',
                activeId === s.id ? 'bg-blue-50' : 'hover:bg-slate-50',
              )}
            >
              <div className="flex items-center gap-1">
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{s.title}</span>
                {/* 操作按钮默认隐藏，hover 行时显示，避免列表视觉噪音 */}
                <span className="hidden shrink-0 gap-1 group-hover:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      renameSession(s);
                    }}
                    className="text-slate-400 hover:text-blue-600"
                    title="重命名"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArchive(s);
                    }}
                    className="text-slate-400 hover:text-amber-600"
                    title={s.archived ? '取消归档' : '归档'}
                  >
                    {s.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSession(s);
                    }}
                    className="text-slate-400 hover:text-red-600"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {new Date(s.updatedAt).toLocaleString('zh-CN', { hour12: false })}
              </div>
            </div>
          ))}
          {sessions.length === 0 && !listLoading && (
            <div className="p-4 text-center text-sm text-slate-400">暂无会话</div>
          )}
          {hasMore && (
            <button
              onClick={() => loadSessions(page + 1, showArchived)}
              disabled={listLoading}
              className="w-full py-2.5 text-sm text-blue-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {listLoading ? '加载中…' : '加载更多'}
            </button>
          )}
        </div>
      </aside>

      {/* ---------- 右侧聊天区 ---------- */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <Bot size={18} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">智能运维助手</span>
          {badge && (
            <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.className)}>
              当前 Agent：{badge.label}
            </span>
          )}
          {streaming && (
            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" />
              正在生成…
            </span>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <Bot size={44} className="mb-3 text-slate-300" />
              <p className="text-sm">选择左侧会话，或直接用下方快捷入口开始提问</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((m) => (
                <div key={m.id} className={clsx('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                  <div
                    className={clsx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white',
                    )}
                  >
                    {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={clsx('min-w-0 max-w-[85%]', m.role === 'user' && 'text-right')}>
                    {m.role === 'user' ? (
                      <div className="inline-block rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-left text-sm leading-6 text-white">
                        {m.content}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {m.steps && m.steps.length > 0 && (
                          <div className="space-y-2">
                            {m.steps.map((step, i) => (
                              <StepCard key={i} step={step} />
                            ))}
                          </div>
                        )}
                        {m.content ? (
                          <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <MarkdownRenderer content={m.content} />
                          </div>
                        ) : (
                          streaming && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Loader2 size={14} className="animate-spin" />
                              正在推理…
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto mb-2 w-full max-w-3xl px-4">
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* ---------- 输入区 ---------- */}
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setInput(q.text)}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter 发送、Shift+Enter 换行，符合主流聊天产品习惯
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="输入你的运维问题，Enter 发送，Shift+Enter 换行"
                className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                aria-label="发送"
              >
                {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
