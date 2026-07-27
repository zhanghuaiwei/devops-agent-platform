/** AI 生成：监控大盘（Pages Router）——SWR 每 3s 轮询 JVM 与系统指标 */
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import Chart from '@/components/charts/Chart';
import { fetcher } from '@/lib/fetcher';
import type { JvmMetrics, SystemMetrics } from '@/types';

const MAX_POINTS = 20; // 图表只保留最近 20 个采样点，防止长时间轮询内存膨胀

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false });
}

function DashboardContent() {
  const { data: jvm } = useSWR<JvmMetrics>('/api/monitor/jvm', fetcher, { refreshInterval: 3000 });
  const { data: system } = useSWR<SystemMetrics>('/api/monitor/system', fetcher, {
    refreshInterval: 3000,
  });

  // 客户端累积历史采样点：接口每次只返回单点，时序图需要本地拼接窗口
  const [jvmHistory, setJvmHistory] = useState<JvmMetrics[]>([]);
  const [sysHistory, setSysHistory] = useState<SystemMetrics[]>([]);
  useEffect(() => {
    if (jvm) setJvmHistory((prev) => [...prev.slice(-(MAX_POINTS - 1)), jvm]);
  }, [jvm]);
  useEffect(() => {
    if (system) setSysHistory((prev) => [...prev.slice(-(MAX_POINTS - 1)), system]);
  }, [system]);

  // JVM 堆内存堆叠柱状图（Eden/Old/Metaspace）
  const heapOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' as const },
      legend: { bottom: 0 },
      grid: { left: 50, right: 16, top: 16, bottom: 40 },
      xAxis: { type: 'category' as const, data: jvmHistory.map((d) => timeLabel(d.timestamp)) },
      yAxis: { type: 'value' as const, name: 'MB' },
      series: [
        { name: 'Eden', type: 'bar' as const, stack: 'heap', data: jvmHistory.map((d) => d.heap.eden), itemStyle: { color: '#60a5fa' } },
        { name: 'Old', type: 'bar' as const, stack: 'heap', data: jvmHistory.map((d) => d.heap.old), itemStyle: { color: '#818cf8' } },
        { name: 'Metaspace', type: 'bar' as const, stack: 'heap', data: jvmHistory.map((d) => d.heap.metaspace), itemStyle: { color: '#c084fc' } },
      ],
    }),
    [jvmHistory],
  );

  // GC 次数/耗时折线（Young/Full 双线：次数左轴，耗时右轴）
  const gcOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' as const },
      legend: { bottom: 0 },
      grid: { left: 50, right: 50, top: 16, bottom: 40 },
      xAxis: { type: 'category' as const, data: jvmHistory.map((d) => timeLabel(d.timestamp)) },
      yAxis: [
        { type: 'value' as const, name: '次数' },
        { type: 'value' as const, name: '耗时(ms)' },
      ],
      series: [
        { name: 'Young GC 累计', type: 'line' as const, smooth: true, data: jvmHistory.map((d) => d.gc.youngCount), itemStyle: { color: '#34d399' } },
        { name: 'Full GC 累计', type: 'line' as const, smooth: true, data: jvmHistory.map((d) => d.gc.fullCount), itemStyle: { color: '#f87171' } },
        { name: 'Young 耗时', type: 'line' as const, yAxisIndex: 1, smooth: true, data: jvmHistory.map((d) => d.gc.youngTimeMs), itemStyle: { color: '#a7f3d0' } },
        { name: 'Full 耗时', type: 'line' as const, yAxisIndex: 1, smooth: true, data: jvmHistory.map((d) => d.gc.fullTimeMs), itemStyle: { color: '#fecaca' } },
      ],
    }),
    [jvmHistory],
  );

  // CPU / 内存折线
  const sysOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' as const },
      legend: { bottom: 0 },
      grid: { left: 44, right: 16, top: 16, bottom: 40 },
      xAxis: { type: 'category' as const, data: sysHistory.map((d) => timeLabel(d.timestamp)) },
      yAxis: { type: 'value' as const, name: '%', max: 100 },
      series: [
        { name: 'CPU', type: 'line' as const, smooth: true, areaStyle: { opacity: 0.15 }, data: sysHistory.map((d) => d.cpu), itemStyle: { color: '#38bdf8' } },
        { name: '内存', type: 'line' as const, smooth: true, areaStyle: { opacity: 0.15 }, data: sysHistory.map((d) => d.memory), itemStyle: { color: '#fb923c' } },
      ],
    }),
    [sysHistory],
  );

  // 线程仪表盘
  const threadGaugeOption = useMemo(() => {
    const live = jvm?.threads.live ?? 0;
    return {
      series: [
        {
          type: 'gauge' as const,
          min: 0,
          max: Math.max(400, (jvm?.threads.peak ?? 400) + 80),
          progress: { show: true, width: 12 },
          axisLine: { lineStyle: { width: 12 } },
          axisLabel: { distance: 18, fontSize: 10 },
          detail: { formatter: '{value} 线程', fontSize: 16, offsetCenter: [0, '70%'] },
          data: [{ value: live, name: '活动线程' }],
          title: { fontSize: 12, offsetCenter: [0, '100%'] },
        },
      ],
    };
  }, [jvm]);

  const deadlocked = jvm?.deadlocked ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">监控大盘</h1>
        <span className="text-xs text-slate-400">每 3 秒自动刷新</span>
      </div>

      {/* 死锁检测状态卡 */}
      <div
        className={clsx(
          'flex items-center gap-3 rounded-xl border p-4',
          deadlocked.length > 0 ? 'border-red-300 bg-red-50 text-red-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700',
        )}
      >
        {deadlocked.length > 0 ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
        <div>
          <div className="font-semibold">
            {deadlocked.length > 0 ? `检测到 ${deadlocked.length} 个死锁线程` : '死锁检测：正常'}
          </div>
          {deadlocked.length > 0 && (
            <div className="mt-0.5 text-sm">涉及线程：{deadlocked.join('、')}，建议立即 dump 线程栈排查</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">JVM 堆内存（MB）</div>
          <Chart option={heapOption} height={280} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">GC 次数与耗时</div>
          <Chart option={gcOption} height={280} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">活动线程</div>
          <Chart option={threadGaugeOption} height={240} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">CPU / 内存使用率</div>
          <Chart option={sysOption} height={240} />
        </div>
      </div>

      {/* Agent 调用统计 */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
          Agent 调用统计
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-4 py-2 font-medium">名称</th>
              <th className="px-4 py-2 font-medium">调用次数</th>
              <th className="px-4 py-2 font-medium">平均耗时</th>
              <th className="px-4 py-2 font-medium">成功率</th>
            </tr>
          </thead>
          <tbody>
            {(system?.agents ?? []).map((a) => (
              <tr key={a.name} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 text-slate-700">{a.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.calls}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.avgMs} ms</td>
                <td className="px-4 py-2.5">
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      a.successRate >= 97 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {a.successRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // 双路由混合的已知妥协：pages/ 下无法复用 app 的 layout，这里手动包一层
  // AuthGuard + AppShell（与 app/(main)/layout.tsx 等效，详见 AppShell 头部注释）
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}
