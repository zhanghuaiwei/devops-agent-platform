/** AI 生成：审查报告组件测试——按级别渲染对应数量的问题卡片 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReviewReport from '@/components/review/ReviewReport';
import type { ReviewIssue, ReviewReport as ReviewReportData, Severity } from '@/types';

/** 构造指定级别分布的报告，只保留测试断言关心的字段 */
function makeReport(levels: Severity[]): ReviewReportData {
  const issues: ReviewIssue[] = levels.map((severity, i) => ({
    id: `i${i}`,
    severity,
    category: '测试问题',
    file: 'src/a.ts',
    line: i + 1,
    description: '描述',
    suggestion: '建议',
  }));
  return {
    id: 'r1',
    prUrl: 'https://github.com/a/b/pull/1',
    verdict: 'fail',
    summary: '测试摘要',
    issues,
    createdAt: new Date().toISOString(),
  };
}

describe('ReviewReport 组件', () => {
  it('按级别渲染对应数量的卡片', () => {
    render(<ReviewReport report={makeReport(['critical', 'critical', 'high', 'low'])} />);
    expect(screen.getAllByTestId('issue-critical')).toHaveLength(2);
    expect(screen.getAllByTestId('issue-high')).toHaveLength(1);
    // 0 个元素时 getAllBy 会抛错，断言为空必须用 queryAllBy
    expect(screen.queryAllByTestId('issue-medium')).toHaveLength(0);
    expect(screen.getAllByTestId('issue-low')).toHaveLength(1);
  });

  it('严重问题排在低危问题前面', () => {
    render(<ReviewReport report={makeReport(['low', 'critical'])} />);
    const all = screen.getAllByTestId(/^issue-/);
    expect(all[0]).toHaveAttribute('data-testid', 'issue-critical');
    expect(all[1]).toHaveAttribute('data-testid', 'issue-low');
  });

  it('展示结论徽标文案', () => {
    render(<ReviewReport report={makeReport(['critical'])} />);
    expect(screen.getByText('审查结论：不通过')).toBeInTheDocument();
  });
});
