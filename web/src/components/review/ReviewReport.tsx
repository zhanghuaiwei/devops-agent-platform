/** AI 生成：审查报告组件——verdict 结论 + 分级问题卡片（纯展示，供页面与测试复用） */
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import type { ReviewReport as ReviewReportData, Severity, Verdict } from '@/types';

interface Props {
  report: ReviewReportData;
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; badge: string; card: string }
> = {
  critical: { label: '严重', badge: 'bg-red-600 text-white', card: 'border-red-300 bg-red-50' },
  high: { label: '高危', badge: 'bg-orange-500 text-white', card: 'border-orange-300 bg-orange-50' },
  medium: { label: '中危', badge: 'bg-yellow-400 text-yellow-900', card: 'border-yellow-300 bg-yellow-50' },
  low: { label: '低危', badge: 'bg-sky-500 text-white', card: 'border-sky-300 bg-sky-50' },
};

const VERDICT_META: Record<Verdict, { label: string; desc: string; className: string; icon: typeof CheckCircle2 }> = {
  pass: { label: '通过', desc: '未发现阻断问题，可以合并', className: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
  warning: { label: '警告', desc: '存在高危问题，建议修复后再合并', className: 'bg-amber-50 text-amber-700 border-amber-300', icon: AlertTriangle },
  fail: { label: '不通过', desc: '存在严重问题，禁止合并', className: 'bg-red-50 text-red-700 border-red-300', icon: XCircle },
};

/** 排序权重：严重的问题排在前面 */
const ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ReviewReport({ report }: Props) {
  const verdict = VERDICT_META[report.verdict];
  const VerdictIcon = verdict.icon;
  const sorted = [...report.issues].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return (
    <div className="space-y-4">
      <div className={clsx('flex items-center gap-3 rounded-xl border p-4', verdict.className)}>
        <VerdictIcon size={28} />
        <div>
          <div className="text-lg font-bold">审查结论：{verdict.label}</div>
          <div className="text-sm opacity-80">{verdict.desc} · {report.summary}</div>
        </div>
        <ShieldAlert className="ml-auto opacity-40" size={36} />
      </div>

      <div className="space-y-3">
        {sorted.map((issue) => {
          const meta = SEVERITY_META[issue.severity];
          return (
            <div
              key={issue.id}
              data-testid={`issue-${issue.severity}`}
              className={clsx('rounded-xl border p-4', meta.card)}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-bold', meta.badge)}>
                  {meta.label}
                </span>
                <span className="font-semibold text-slate-800">{issue.category}</span>
                <code className="ml-auto rounded bg-white/70 px-2 py-0.5 text-xs text-slate-500">
                  {issue.file}:{issue.line}
                </code>
              </div>
              <p className="text-sm leading-6 text-slate-700">{issue.description}</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                <span className="font-medium text-slate-600">修复建议：</span>
                {issue.suggestion}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
