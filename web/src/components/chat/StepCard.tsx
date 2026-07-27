'use client';
/** AI 生成：Agent 推理步骤卡片——thought/action/observation 三种形态，可折叠 */
import { useState } from 'react';
import clsx from 'clsx';
import { Brain, ChevronDown, Eye, Wrench } from 'lucide-react';
import type { AgentStep } from '@/types';

interface Props {
  step: AgentStep;
}

const META = {
  thought: { label: '思考', icon: Brain, border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700' },
  action: { label: '工具调用', icon: Wrench, border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
  observation: { label: '观察结果', icon: Eye, border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700' },
} as const;

export default function StepCard({ step }: Props) {
  // 默认展开：流式到达的步骤用户最关心，折叠交给用户主动操作
  const [open, setOpen] = useState(true);
  const meta = META[step.type];
  const Icon = meta.icon;

  return (
    <div className={clsx('rounded-lg border text-sm', meta.border, meta.bg)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <Icon size={15} className={meta.text} />
        <span className={clsx('font-medium', meta.text)}>{meta.label}</span>
        {step.type === 'action' && step.tool && (
          <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">{step.tool}</code>
        )}
        <ChevronDown
          size={15}
          className={clsx('ml-auto text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="border-t border-inherit px-3 py-2">
          {step.type === 'thought' && <p className="leading-6 text-slate-600">{step.content}</p>}
          {step.type === 'action' && step.params && (
            <pre className="overflow-x-auto rounded bg-white/70 p-2 text-xs text-slate-600">
              {JSON.stringify(step.params, null, 2)}
            </pre>
          )}
          {step.type === 'observation' && <p className="leading-6 text-slate-600">{step.summary}</p>}
        </div>
      )}
    </div>
  );
}
