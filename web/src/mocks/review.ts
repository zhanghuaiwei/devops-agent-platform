/** AI 生成：代码审查 mock——分级问题报告与历史记录 */
import type { ReviewHistoryItem, ReviewIssue, ReviewReport, Severity, Verdict } from '@/types';
import { getStore, mockId } from './utils';

const ISSUE_POOL: Array<Omit<ReviewIssue, 'id'>> = [
  {
    severity: 'critical',
    category: '硬编码密钥',
    file: 'src/config/db.ts',
    line: 12,
    description: '数据库密码以明文硬编码在源码中，一旦泄露可直接拖库。',
    suggestion: '改用环境变量或密钥管理服务（如 Vault），并立即轮换已泄露的密钥。',
  },
  {
    severity: 'high',
    category: 'SQL 注入',
    file: 'src/services/user.ts',
    line: 87,
    description: '使用字符串拼接构造 SQL 语句，攻击者可注入任意 SQL 片段。',
    suggestion: '改用参数化查询（prepared statement），禁止拼接用户输入。',
  },
  {
    severity: 'high',
    category: 'XSS 跨站脚本',
    file: 'src/components/Comment.tsx',
    line: 45,
    description: 'dangerouslySetInnerHTML 直接渲染用户输入，存在存储型 XSS 风险。',
    suggestion: '渲染前使用 DOMPurify 消毒，或改用 Markdown 白名单渲染。',
  },
  {
    severity: 'medium',
    category: '圈复杂度过高',
    file: 'src/utils/order.ts',
    line: 120,
    description: 'calcOrderPrice 函数圈复杂度 18，分支嵌套过深，难以测试与维护。',
    suggestion: '按优惠类型拆分为策略函数，主函数只做编排，复杂度降到 10 以下。',
  },
  {
    severity: 'medium',
    category: '未处理的 Promise',
    file: 'src/api/client.ts',
    line: 33,
    description: '异步调用缺少 catch，异常会变成 unhandledrejection 静默丢失。',
    suggestion: '统一在请求层 catch 并上报监控，或改用 await + try/catch。',
  },
  {
    severity: 'low',
    category: '代码风格',
    file: 'src/styles/button.ts',
    line: 5,
    description: '变量命名不符合团队规范（使用了拼音缩写）。',
    suggestion: '按 ESLint 规则重命名为有语义的英文名，并开启 lint --fix。',
  },
  {
    severity: 'low',
    category: '重复代码',
    file: 'src/pages/list.tsx',
    line: 66,
    description: '与 src/pages/detail.tsx 存在 40 行重复逻辑。',
    suggestion: '抽取为公共 hook（如 useTableQuery）复用。',
  },
];

function countBySeverity(issues: ReviewIssue[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}

function verdictOf(counts: Record<Severity, number>): Verdict {
  if (counts.critical > 0) return 'fail';
  if (counts.high > 0) return 'warning';
  return 'pass';
}

/** 生成一份完整审查报告；提交成功的同时写入历史记录 */
export function buildReport(prUrl: string): ReviewReport {
  const issues: ReviewIssue[] = ISSUE_POOL.map((issue) => ({ ...issue, id: mockId('issue') }));
  const counts = countBySeverity(issues);
  const verdict = verdictOf(counts);
  const report: ReviewReport = {
    id: mockId('report'),
    prUrl,
    verdict,
    summary: `共发现 ${issues.length} 个问题：严重 ${counts.critical}、高危 ${counts.high}、中危 ${counts.medium}、低危 ${counts.low}。${
      verdict === 'fail' ? '存在阻断级问题，不建议合并。' : '请按级别依次处理。'
    }`,
    issues,
    createdAt: new Date().toISOString(),
  };
  const history = historyStore();
  history.unshift({
    id: report.id,
    prUrl,
    verdict,
    counts,
    createdAt: report.createdAt,
  });
  // 只保留最近 20 条，避免内存无限增长
  if (history.length > 20) history.length = 20;
  return report;
}

export function historyStore(): ReviewHistoryItem[] {
  return getStore<ReviewHistoryItem[]>('devops_review_history', () => {
    const now = Date.now();
    return [
      {
        id: 'hist_1',
        prUrl: 'https://github.com/devops/platform/pull/128',
        verdict: 'fail',
        counts: { critical: 1, high: 2, medium: 2, low: 2 },
        createdAt: new Date(now - 3600_000).toISOString(),
      },
      {
        id: 'hist_2',
        prUrl: 'https://github.com/devops/platform/pull/125',
        verdict: 'warning',
        counts: { critical: 0, high: 1, medium: 3, low: 2 },
        createdAt: new Date(now - 86400_000).toISOString(),
      },
      {
        id: 'hist_3',
        prUrl: 'https://github.com/devops/platform/pull/120',
        verdict: 'pass',
        counts: { critical: 0, high: 0, medium: 1, low: 3 },
        createdAt: new Date(now - 2 * 86400_000).toISOString(),
      },
    ];
  });
}
