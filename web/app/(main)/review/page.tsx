'use client';
/** AI 生成：代码审查页——提交 PR URL → 分级报告（饼图 + 卡片）→ 历史表格可展开 */
import { Fragment, useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { ChevronDown, GitPullRequest, Loader2, Search } from 'lucide-react';
import Chart from '@/components/charts/Chart';
import ReviewReport, { SEVERITY_META } from '@/components/review/ReviewReport';
import { fetcher } from '@/lib/fetcher';
import type { ReviewHistoryItem, ReviewReport as ReviewReportData, Severity } from '@/types';

const VERDICT_TEXT = { pass: '通过', warning: '警告', fail: '不通过' } as const;
const VERDICT_CLASS = {
  pass: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  fail: 'bg-red-100 text-red-700',
} as const;

export default function ReviewPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReviewReportData | null>(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: history, mutate } = useSWR<ReviewHistoryItem[]>('/api/review/history', fetcher);

  const submit = async () => {
    const prUrl = url.trim();
    if (!prUrl || loading) return;
    setError('');
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl }),
      });
      const data = (await res.json()) as ReviewReportData & { error?: string };
      if (!res.ok) {
        setError(data.error ?? '审查失败，请重试');
        return;
      }
      setReport(data);
      // 服务端已把本次审查写入历史，重新拉取让表格即时出现新记录
      mutate();
    } catch {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 饼图统计各级别问题数量；零值系列保留以维持图例稳定
  const pieOption = useMemo(() => {
    if (!report) return {};
    const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const issue of report.issues) counts[issue.severity] += 1;
    const colors: Record<Severity, string> = {
      critical: '#dc2626',
      high: '#f97316',
      medium: '#facc15',
      low: '#0ea5e9',
    };
    return {
      tooltip: { trigger: 'item' as const },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie' as const,
          radius: ['40%', '70%'],
          label: { formatter: '{b}: {c}' },
          data: (Object.keys(counts) as Severity[]).map((sev) => ({
            name: SEVERITY_META[sev].label,
            value: counts[sev],
            itemStyle: { color: colors[sev] },
          })),
        },
      ],
    };
  }, [report]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <GitPullRequest size={22} />
          代码审查
        </h1>
        <p className="mt-1 text-sm text-slate-500">输入 GitHub PR 链接，Agent 输出分级问题报告</p>
      </div>

      {/* 提交区 */}
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="https://github.com/owner/repo/pull/123"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={submit}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? '审查中…' : '开始审查'}
        </button>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      {/* 加载态骨架 */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          Agent 正在拉取 PR 并扫描代码，请稍候…
        </div>
      )}

      {/* 报告：verdict + 饼图 + 分级卡片 */}
      {report && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <ReviewReport report={report} />
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-sm font-medium text-slate-600">问题级别分布</div>
            <Chart option={pieOption} height={240} />
          </div>
        </div>
      )}

      {/* 历史记录 */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
          历史审查记录
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-2 font-medium">PR 链接</th>
              <th className="px-4 py-2 font-medium">结论</th>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {(history ?? []).map((h) => (
              <Fragment key={h.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="max-w-0 truncate px-4 py-2.5 text-slate-600" style={{ maxWidth: 320 }}>
                    {h.prUrl}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', VERDICT_CLASS[h.verdict])}>
                      {VERDICT_TEXT[h.verdict]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {new Date(h.createdAt).toLocaleString('zh-CN', { hour12: false })}
                  </td>
                  <td className="px-2 text-slate-400">
                    <ChevronDown
                      size={15}
                      className={clsx('transition-transform', expandedId === h.id && 'rotate-180')}
                    />
                  </td>
                </tr>
                {expandedId === h.id && (
                  <tr className="border-b border-slate-50 bg-slate-50/60">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="flex flex-wrap gap-3 text-xs">
                        {(Object.keys(h.counts) as Severity[]).map((sev) => (
                          <span
                            key={sev}
                            className={clsx('rounded-full px-2.5 py-1 font-medium', SEVERITY_META[sev].badge)}
                          >
                            {SEVERITY_META[sev].label} × {h.counts[sev]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {(history ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  暂无历史记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
