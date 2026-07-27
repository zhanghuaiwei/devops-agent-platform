'use client';
/** AI 生成：Markdown 渲染器——GFM 表格 + 代码高亮 + 代码块右上角复制按钮 */
import { isValidElement, useState, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';

interface Props {
  content: string;
}

/** 从 React 子节点树里递归提取纯文本，用于复制代码块内容 */
function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

/** 自定义 pre：包一层相对定位容器，在右上角放复制按钮 */
function PreBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractText(children));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板权限被拒时静默失败，不阻断阅读
    }
  };

  return (
    <div className="group relative my-3">
      <button
        onClick={onCopy}
        aria-label="复制代码"
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-slate-700/90 px-2 py-1 text-xs text-slate-200 opacity-0 transition-opacity hover:bg-slate-600 group-hover:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? '已复制' : '复制'}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  pre: PreBlock,
  // 收窄常用标签样式，保证中文长文可读性
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-bold text-slate-800">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold text-slate-800">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-7 text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-6 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-6 text-slate-700">{children}</ol>,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border border-slate-300 px-3 py-1.5">{children}</td>,
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] text-rose-600">{children}</code>
    ),
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
