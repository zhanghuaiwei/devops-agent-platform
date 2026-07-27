/** AI 生成：流水线页（Pages Router）——最近构建、Jobs/Steps 耗时、失败率趋势、重新运行 */
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { CheckCircle2, ChevronDown, Loader2, RotateCcw, XCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import Chart from '@/components/charts/Chart';
import { fetcher } from '@/lib/fetcher';
import type { PipelineRun, PipelineStats, RunStatus } from '@/types';

const STATUS_META: Record<RunStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  success: { label: '成功', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  failed: { label: '失败', className: 'bg-red-100 text-red-700', icon: XCircle },
  running: { label: '进行中', className: 'bg-blue-100 text-blue-700', icon: Loader2 },
};

function formatDuration(sec: number): string {
  if (sec <= 0) return '-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

function PipelineContent() {
  const { data: runs, mutate } = useSWR<PipelineRun[]>('/api/pipeline/runs', fetcher);
  const { data: stats } = useSWR<PipelineStats>('/api/pipeline/stats', fetcher);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const rerun = async (run: PipelineRun) => {
    if (rerunningId) return;
    setRerunningId(run.id);
    try {
      const res = await fetch(`/api/pipeline/runs/${run.id}/rerun`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as PipelineRun;
      // 乐观更新：直接用接口返回替换本地缓存，不等整表重拉
      mutate(
        (prev) => {
          const rest = (prev ?? []).filter((r) => r.id !== updated.id);
          return [updated, ...rest].slice(0, 10);
        },
        { revalidate: true },
      );
      showToast(`已触发重新运行：${updated.name} #${updated.id}`);
    } catch {
      showToast('触发失败，请稍后再试');
    } finally {
      setRerunningId(null);
    }
  };

  // 近 30 天失败率折线
  const statsOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' as const, valueFormatter: (v: unknown) => `${v}%` },
      grid: { left: 44, right: 16, top: 16, bottom: 30 },
      xAxis: { type: 'category' as const, data: stats?.days.map((d) => d.date) ?? [] },
      yAxis: { type: 'value' as const, name: '%' },
      series: [
        {
          name: '失败率',
          type: 'line' as const,
          smooth: true,
          areaStyle: { opacity: 0.12 },
          data: stats?.days.map((d) => d.failureRate) ?? [],
          itemStyle: { color: '#f87171' },
        },
      ],
    }),
    [stats],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-xl font-bold text-slate-800">CI/CD 流水线</h1>

      {toast && (
        <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>
      )}

      {/* 失败率趋势 */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-sm font-medium text-slate-600">近 30 天构建失败率</div>
        <Chart option={statsOption} height={220} />
      </div>

      {/* 最近构建列表 */}
      <div className="space-y-3">
        {(runs ?? []).map((run) => {
          const meta = STATUS_META[run.status];
          const StatusIcon = meta.icon;
          const expanded = expandedId === run.id;
          return (
            <div key={run.id} className="rounded-xl border border-slate-200 bg-white">
              <div
                onClick={() => setExpandedId(expanded ? null : run.id)}
                className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <StatusIcon
                  size={18}
                  className={clsx(
                    run.status === 'success' && 'text-emerald-500',
                    run.status === 'failed' && 'text-red-500',
                    run.status === 'running' && 'animate-spin text-blue-500',
                  )}
                />
                <span className="font-medium text-slate-700">{run.name}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{run.branch}</span>
                <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', meta.className)}>
                  {meta.label}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(run.startedAt).toLocaleString('zh-CN', { hour12: false })} ·{' '}
                  {formatDuration(run.durationSec)} · 触发：{run.trigger}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rerun(run);
                    }}
                    disabled={rerunningId === run.id}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                  >
                    {rerunningId === run.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    重新运行
                  </button>
                  <ChevronDown
                    size={16}
                    className={clsx('text-slate-400 transition-transform', expanded && 'rotate-180')}
                  />
                </span>
              </div>

              {/* 展开：Jobs → Steps 耗时横向条形图 */}
              {expanded && (
                <div className="grid gap-4 border-t border-slate-100 p-4 md:grid-cols-3">
                  {run.jobs.map((job) => {
                    const jobMeta = STATUS_META[job.status];
                    return (
                      <div key={job.name} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{job.name}</span>
                          <span className={clsx('rounded-full px-2 py-0.5 text-xs', jobMeta.className)}>
                            {jobMeta.label}
                          </span>
                        </div>
                        <Chart
                          height={36 * job.steps.length + 40}
                          option={{
                            tooltip: { trigger: 'axis' as const },
                            grid: { left: 70, right: 40, top: 8, bottom: 8 },
                            xAxis: { type: 'value' as const, show: false },
                            yAxis: {
                              type: 'category' as const,
                              // 横向条形图需要反转类目轴，让第一个步骤显示在最上面
                              inverse: true,
                              data: job.steps.map((s) => s.name),
                              axisLabel: { fontSize: 11 },
                              axisLine: { show: false },
                              axisTick: { show: false },
                            },
                            series: [
                              {
                                type: 'bar' as const,
                                barWidth: 14,
                                label: { show: true, position: 'right' as const, formatter: '{c}s', fontSize: 11 },
                                data: job.steps.map((s) => ({
                                  value: s.durationSec,
                                  itemStyle: {
                                    color:
                                      s.status === 'failed'
                                        ? '#f87171'
                                        : s.status === 'running'
                                          ? '#60a5fa'
                                          : '#34d399',
                                    borderRadius: 3,
                                  },
                                })),
                              },
                            ],
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {!runs && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            加载构建记录…
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  // 与 dashboard.tsx 相同的双路由混合妥协：手动包 AuthGuard + AppShell
  return (
    <AuthGuard>
      <AppShell>
        <PipelineContent />
      </AppShell>
    </AuthGuard>
  );
}
