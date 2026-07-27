/** AI 生成：流水线 mock——最近构建、近 30 天失败率、重新运行 */
import type { PipelineJob, PipelineRun, PipelineStats, RunStatus } from '@/types';
import { getStore } from './utils';

function job(name: string, status: RunStatus, steps: Array<[string, number]>): PipelineJob {
  return {
    name,
    status,
    steps: steps.map(([stepName, durationSec]) => ({
      name: stepName,
      durationSec,
      // 失败任务的后续步骤标记为失败/未执行，这里统一简化：整体失败则最后一个步骤失败
      status: status === 'failed' && stepName === steps[steps.length - 1][0] ? 'failed' : 'success',
    })),
  };
}

function seedRuns(): PipelineRun[] {
  const now = Date.now();
  const defs: Array<[string, string, RunStatus, string]> = [
    ['backend-ci', 'main', 'success', 'push'],
    ['web-build', 'main', 'success', 'push'],
    ['backend-ci', 'release/1.8', 'failed', 'mr'],
    ['deploy-prod', 'main', 'success', 'manual'],
    ['web-build', 'feature/chart', 'failed', 'push'],
    ['backend-ci', 'main', 'success', 'schedule'],
    ['e2e-tests', 'main', 'failed', 'schedule'],
    ['deploy-staging', 'develop', 'success', 'push'],
    ['backend-ci', 'main', 'running', 'push'],
    ['image-scan', 'main', 'success', 'schedule'],
  ];
  return defs.map(([name, branch, status, trigger], i) => {
    const jobs: PipelineJob[] = [
      job('build', status === 'failed' ? 'failed' : 'success', [
        ['拉取代码', 12 + i],
        ['依赖安装', 45 + i * 2],
        ['编译打包', 90 + i * 3],
      ]),
      job('test', status === 'failed' ? 'failed' : 'success', [
        ['单元测试', 120 + i * 4],
        ['静态扫描', 60 + i],
        ['覆盖率上报', 15],
      ]),
      job('deploy', status, [
        ['镜像构建', 80 + i * 2],
        ['推送仓库', 30],
        ['滚动发布', 150 + i * 5],
      ]),
    ];
    const durationSec = jobs.reduce(
      (acc, j) => acc + j.steps.reduce((a, s) => a + s.durationSec, 0),
      0,
    );
    return {
      id: `run_${340 - i}`,
      name,
      branch,
      status,
      trigger,
      startedAt: new Date(now - i * 5400_000).toISOString(),
      durationSec,
      jobs,
    };
  });
}

export function runsStore(): PipelineRun[] {
  return getStore<PipelineRun[]>('devops_pipeline_runs', seedRuns);
}

/** 重新运行：把该次构建标记为 running 并置顶，模拟触发新一次执行 */
export function rerun(id: string): PipelineRun | null {
  const runs = runsStore();
  const idx = runs.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const target = runs[idx];
  const restarted: PipelineRun = {
    ...target,
    status: 'running',
    startedAt: new Date().toISOString(),
    durationSec: 0,
    jobs: target.jobs.map((j) => ({
      ...j,
      status: 'running',
      steps: j.steps.map((s) => ({ ...s, status: 'running' as const })),
    })),
  };
  runs.splice(idx, 1);
  runs.unshift(restarted);
  return restarted;
}

export function statsStore(): PipelineStats {
  return getStore<PipelineStats>('devops_pipeline_stats', () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400_000);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        // 用正弦 + 噪声造出有趋势感的失败率，避免纯随机锯齿
        failureRate: Math.round((15 + 10 * Math.sin(i / 4) + Math.random() * 6) * 10) / 10,
      };
    });
    return { days };
  });
}
