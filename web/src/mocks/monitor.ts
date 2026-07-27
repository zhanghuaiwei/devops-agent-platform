/** AI 生成：JVM / 系统指标 mock，随机游走模拟真实波动，SWR 轮询时数据持续变化 */
import type { AgentStat, JvmMetrics, SystemMetrics } from '@/types';
import { getStore } from './utils';

/** 在 [min, max] 区间内对 v 做 ±delta 的随机游走，避免曲线跳变过于突兀 */
function walk(v: number, delta: number, min: number, max: number): number {
  const next = v + (Math.random() * 2 - 1) * delta;
  return Math.min(max, Math.max(min, Math.round(next * 10) / 10));
}

interface JvmState {
  eden: number;
  old: number;
  metaspace: number;
  youngCount: number;
  fullCount: number;
  live: number;
  tick: number;
}

export function genJvmMetrics(): JvmMetrics {
  const s = getStore<JvmState>('devops_jvm_state', () => ({
    eden: 512,
    old: 1024,
    metaspace: 180,
    youngCount: 120,
    fullCount: 3,
    live: 210,
    tick: 0,
  }));
  s.tick += 1;
  s.eden = walk(s.eden, 60, 128, 900);
  s.old = walk(s.old, 30, 600, 1800);
  s.metaspace = walk(s.metaspace, 4, 150, 220);
  s.live = Math.round(walk(s.live, 12, 120, 380));
  // Young GC 几乎每个采样周期都发生；Full GC 低频，体现真实 JVM 特征
  const youngOccur = 1 + Math.floor(Math.random() * 3);
  s.youngCount += youngOccur;
  const youngTimeMs = youngOccur * Math.round(8 + Math.random() * 20);
  let fullTimeMs = 0;
  if (s.tick % 11 === 0) {
    s.fullCount += 1;
    fullTimeMs = Math.round(180 + Math.random() * 300);
  }
  return {
    timestamp: Date.now(),
    heap: { eden: s.eden, old: s.old, metaspace: s.metaspace },
    gc: { youngCount: s.youngCount, youngTimeMs, fullCount: s.fullCount, fullTimeMs },
    threads: { live: s.live, peak: Math.max(s.live, 320), daemon: 96 },
    // 周期性制造一次短暂死锁告警，让状态卡有变化可演示
    deadlocked: s.tick % 13 === 0 ? ['order-worker-3', 'pay-callback-1'] : [],
  };
}

interface AgentState extends AgentStat {
  baseMs: number;
}

export function genSystemMetrics(): SystemMetrics {
  const s = getStore<{ cpu: number; memory: number; agents: AgentState[] }>(
    'devops_system_state',
    () => ({
      cpu: 42,
      memory: 63,
      agents: [
        { name: '代码审查 Agent', calls: 128, avgMs: 860, baseMs: 860, successRate: 98.4 },
        { name: '部署检查 Agent', calls: 96, avgMs: 620, baseMs: 620, successRate: 99.1 },
        { name: '故障诊断 Agent', calls: 74, avgMs: 1180, baseMs: 1180, successRate: 95.9 },
        { name: '日志分析 Agent', calls: 210, avgMs: 340, baseMs: 340, successRate: 99.8 },
      ],
    }),
  );
  s.cpu = walk(s.cpu, 8, 12, 92);
  s.memory = walk(s.memory, 3, 40, 88);
  for (const a of s.agents) {
    a.calls += Math.floor(Math.random() * 4);
    a.avgMs = Math.round(walk(a.avgMs, 60, a.baseMs * 0.6, a.baseMs * 1.6));
    a.successRate = walk(a.successRate, 0.4, 90, 100);
  }
  return {
    timestamp: Date.now(),
    cpu: s.cpu,
    memory: s.memory,
    // 对外输出时去掉内部字段 baseMs（仅用于随机游走基准）
    agents: s.agents.map((a) => ({ name: a.name, calls: a.calls, avgMs: a.avgMs, successRate: a.successRate })),
  };
}
