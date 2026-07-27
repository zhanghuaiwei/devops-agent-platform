/** AI 生成：平台共享类型定义（页面、API、mock 三方共用，避免各处重复声明） */

// ---------- 认证 ----------
export type Role = 'ADMIN' | 'DEVELOPER' | 'VIEWER';

export interface User {
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  /** accessToken 有效期（秒），mock 为 2 小时 */
  expiresIn: number;
  /** refreshToken 有效期（秒），mock 为 7 天 */
  refreshExpiresIn: number;
  user: User;
}

// ---------- Chat ----------
export type Intent = 'code_review' | 'deploy' | 'diagnose' | 'general';

export interface ChatSession {
  id: string;
  title: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Agent 推理过程的一个步骤：思考 / 工具调用 / 观察结果 */
export interface AgentStep {
  type: 'thought' | 'action' | 'observation';
  /** thought 的文本内容 */
  content?: string;
  /** action 调用的工具名 */
  tool?: string;
  /** action 的调用参数 */
  params?: Record<string, unknown>;
  /** observation 的返回摘要 */
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: AgentStep[];
  intent?: Intent;
  createdAt: string;
}

export interface SessionListResponse {
  items: ChatSession[];
  hasMore: boolean;
  total: number;
}

// ---------- 代码审查 ----------
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Verdict = 'pass' | 'warning' | 'fail';

export interface ReviewIssue {
  id: string;
  severity: Severity;
  category: string;
  file: string;
  line: number;
  description: string;
  suggestion: string;
}

export interface ReviewReport {
  id: string;
  prUrl: string;
  verdict: Verdict;
  summary: string;
  issues: ReviewIssue[];
  createdAt: string;
}

export interface ReviewHistoryItem {
  id: string;
  prUrl: string;
  verdict: Verdict;
  counts: Record<Severity, number>;
  createdAt: string;
}

// ---------- 监控 ----------
export interface JvmMetrics {
  timestamp: number;
  heap: {
    eden: number;
    old: number;
    metaspace: number;
  };
  gc: {
    youngCount: number;
    youngTimeMs: number;
    fullCount: number;
    fullTimeMs: number;
  };
  threads: {
    live: number;
    peak: number;
    daemon: number;
  };
  /** 死锁线程名列表，空数组表示无死锁 */
  deadlocked: string[];
}

export interface AgentStat {
  name: string;
  calls: number;
  avgMs: number;
  successRate: number;
}

export interface SystemMetrics {
  timestamp: number;
  /** CPU 使用率百分比 */
  cpu: number;
  /** 内存使用率百分比 */
  memory: number;
  agents: AgentStat[];
}

// ---------- 流水线 ----------
export type RunStatus = 'success' | 'failed' | 'running';

export interface PipelineStep {
  name: string;
  durationSec: number;
  status: RunStatus;
}

export interface PipelineJob {
  name: string;
  status: RunStatus;
  steps: PipelineStep[];
}

export interface PipelineRun {
  id: string;
  name: string;
  branch: string;
  status: RunStatus;
  trigger: string;
  startedAt: string;
  durationSec: number;
  jobs: PipelineJob[];
}

export interface PipelineStats {
  days: Array<{ date: string; failureRate: number }>;
}
