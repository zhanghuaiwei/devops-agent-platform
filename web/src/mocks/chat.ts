/** AI 生成：Chat 模块 mock 数据——会话列表、意图分类、流式剧本 */
import type { AgentStep, ChatSession, Intent } from '@/types';
import { getStore, mockId } from './utils';

/** 各意图对应的 Agent 中文名，用于聊天区顶部徽标 */
export const INTENT_LABELS: Record<Intent, string> = {
  code_review: '代码审查',
  deploy: '部署检查',
  diagnose: '故障诊断',
  general: '通用助手',
};

/**
 * 关键词意图分类：模拟后端 NLU。
 * 规则按优先级排列，命中即返回；都没有命中时归为通用对话。
 */
export function classifyIntent(message: string): Intent {
  const text = message.toLowerCase();
  if (/(pull request|\bpr\b|审查|review)/.test(text)) return 'code_review';
  if (/(部署|deploy|发布|上线)/.test(text)) return 'deploy';
  if (/(故障|诊断|diagnose|宕机|报错|异常|502|500|超时)/.test(text)) return 'diagnose';
  return 'general';
}

/** 一套流式剧本：先依次推送 thought/action/observation 步骤，再逐字输出 answer */
export interface ChatScript {
  intent: Intent;
  steps: AgentStep[];
  answer: string;
}

const CODE_REVIEW_SCRIPT: ChatScript = {
  intent: 'code_review',
  steps: [
    { type: 'thought', content: '用户想审查一个 PR，我先拉取 PR 的变更概览与涉及文件列表。' },
    {
      type: 'action',
      tool: 'github.get_pull_request',
      params: { repo: 'devops/platform', pr: 128, includeDiff: true },
    },
    { type: 'observation', summary: '获取成功：12 个变更文件，+320/-85 行，涉及 auth、order 两个模块。' },
    { type: 'thought', content: '变更集中在鉴权与订单链路，接下来对 diff 做安全扫描和风格检查。' },
    {
      type: 'action',
      tool: 'code.scan_diff',
      params: { rules: ['security', 'sqli', 'xss', 'style'], diffRef: 'pr-128' },
    },
    { type: 'observation', summary: '扫描完成：发现 1 个严重、2 个高危、2 个中危问题。' },
    { type: 'thought', content: '信息已足够，整理审查结论并给出修复建议。' },
  ],
  answer: `## PR #128 审查报告

**结论：不建议合并**（存在 1 个严重问题）

| 级别 | 数量 | 说明 |
| --- | --- | --- |
| 严重 | 1 | 硬编码密钥 |
| 高危 | 2 | SQL 注入、XSS |
| 中危 | 2 | 圈复杂度、未处理 Promise |

### 关键问题

1. **硬编码密钥**：\`src/config/db.ts:12\` 明文写入数据库密码，请改用环境变量：

\`\`\`ts
// 修复前
const password = 'P@ssw0rd!';
// 修复后
const password = process.env.DB_PASSWORD;
if (!password) throw new Error('缺少 DB_PASSWORD');
\`\`\`

2. **SQL 注入**：\`src/services/user.ts:87\` 直接拼接 SQL，请改用参数化查询。
3. **XSS**：\`src/components/Comment.tsx:45\` 使用 \`dangerouslySetInnerHTML\`，请先经过 DOMPurify 消毒。

建议先修复严重与高危项后再重新提交审查。`,
};

const DEPLOY_SCRIPT: ChatScript = {
  intent: 'deploy',
  steps: [
    { type: 'thought', content: '用户要检查部署状态，先获取最近一次流水线与当前环境信息。' },
    {
      type: 'action',
      tool: 'pipeline.latest_run',
      params: { project: 'devops-platform', branch: 'main' },
    },
    { type: 'observation', summary: '最近构建 #347：成功，耗时 6 分 12 秒，产物镜像 tag v1.8.3。' },
    { type: 'thought', content: '构建没问题，再检查生产环境各实例的健康检查与资源水位。' },
    {
      type: 'action',
      tool: 'k8s.health_check',
      params: { namespace: 'prod', deployment: 'platform-server' },
    },
    { type: 'observation', summary: '6/6 副本就绪；CPU 均值 41%，内存均值 63%；无重启记录。' },
    { type: 'thought', content: '构建与运行态均健康，汇总部署检查结论。' },
  ],
  answer: `## 部署检查结果：健康

- **最近构建**：#347 成功（6 分 12 秒），镜像 \`platform-server:v1.8.3\`
- **副本状态**：6/6 就绪，无异常重启
- **资源水位**：CPU 41%，内存 63%，均在阈值内
- **灰度策略**：当前为全量发布，下一次发布建议开启 10% 灰度

\`\`\`bash
# 如需回滚到上一版本
kubectl rollout undo deployment/platform-server -n prod
\`\`\`

结论：本次部署可以正常放量，无需人工干预。`,
};

const DIAGNOSE_SCRIPT: ChatScript = {
  intent: 'diagnose',
  steps: [
    { type: 'thought', content: '用户反馈线上 502 增多，先看网关错误率与应用实例状态。' },
    {
      type: 'action',
      tool: 'metrics.query',
      params: { metric: 'nginx.5xx_rate', range: '1h' },
    },
    { type: 'observation', summary: '5xx 比例从 10:05 起升到 8.7%，集中在 /api/order 路径。' },
    { type: 'thought', content: '错误集中在订单链路，怀疑下游依赖，查一下订单服务的调用链与线程池。' },
    {
      type: 'action',
      tool: 'trace.analyze',
      params: { service: 'order-service', span: '1h', slowOnly: true },
    },
    { type: 'observation', summary: '慢调用 92% 卡在 inventory RPC（p99 4.8s）；order-service 线程池打满。' },
    { type: 'thought', content: '根因定位到库存服务超时拖垮订单线程池，给出处置建议。' },
  ],
  answer: `## 故障诊断：订单服务 502

**根因**：库存服务（inventory）响应劣化，p99 达 4.8s，拖垮 order-service 的 RPC 线程池，最终网关返回 502。

### 时间线

1. 10:05 库存服务发布 \`v2.3.1\`
2. 10:07 inventory p99 开始攀升
3. 10:12 order-service 线程池耗尽，5xx 达 8.7%

### 处置建议

\`\`\`bash
# 1. 立即回滚库存服务
kubectl rollout undo deployment/inventory -n prod
# 2. 临时调低订单超时并开启熔断
kubectl set env deploy/order-service RPC_TIMEOUT_MS=800 CIRCUIT_BREAKER=on
\`\`\`

长期建议：为 inventory 调用增加舱壁隔离（独立线程池），避免单点依赖拖垮主链路。`,
};

const GENERAL_SCRIPT: ChatScript = {
  intent: 'general',
  steps: [
    { type: 'thought', content: '这是一个通用运维问题，我先检索平台知识库中的相关资料。' },
    {
      type: 'action',
      tool: 'kb.search',
      params: { topK: 5 },
    },
    { type: 'observation', summary: '命中 3 篇运维手册与 2 条历史故障复盘。' },
    { type: 'thought', content: '资料足够，组织成可操作的回答。' },
  ],
  answer: `你好，我是 DevOps 智能运维助手，可以帮你：

- **审查 PR**：粘贴 GitHub PR 链接，输出分级问题报告
- **检查部署**：查看最近构建与生产健康状态
- **诊断故障**：根据现象定位根因并给出处置建议
- **查看日志**：检索并聚合指定服务的日志

直接把问题发给我即可，例如「帮我诊断一下订单服务为什么大量超时」。`,
};

const SCRIPTS: Record<Intent, ChatScript> = {
  code_review: CODE_REVIEW_SCRIPT,
  deploy: DEPLOY_SCRIPT,
  diagnose: DIAGNOSE_SCRIPT,
  general: GENERAL_SCRIPT,
};

export function getScript(intent: Intent): ChatScript {
  return SCRIPTS[intent] ?? GENERAL_SCRIPT;
}

// ---------- 会话存储 ----------

interface SessionStore {
  sessions: ChatSession[];
  seq: number;
}

const TITLES = [
  '线上 502 排查',
  'PR #128 审查',
  '生产发布前检查',
  '库存服务超时诊断',
  '网关错误率分析',
  '数据库慢查询优化',
  '镜像构建失败排查',
  '线程池打满诊断',
  '订单链路压测复盘',
  '缓存穿透处理',
  'K8s 滚动发布验证',
  '日志采集延迟排查',
  '证书到期提醒配置',
  '灰度发布方案讨论',
  'JVM Full GC 频繁',
  '接口超时告警配置',
  '依赖漏洞升级清单',
  '消息队列积压处理',
  '磁盘水位告警排查',
  '多环境配置比对',
  '限流阈值评估',
  '审计日志导出',
  '新人环境搭建答疑',
];

function seedSessions(): SessionStore {
  const now = Date.now();
  return {
    // 预置 23 条，保证「每页 10 条」能演示三页加载更多
    sessions: TITLES.map((title, i) => ({
      id: `seed_${i + 1}`,
      title,
      archived: i >= 20, // 最后 3 条预置为已归档，便于演示归档切换
      createdAt: new Date(now - (i + 1) * 3600_000).toISOString(),
      updatedAt: new Date(now - (i + 1) * 1800_000).toISOString(),
    })),
    seq: 0,
  };
}

export function sessionStore(): SessionStore {
  return getStore<SessionStore>('devops_chat_sessions', seedSessions);
}

export function createSession(title: string): ChatSession {
  const store = sessionStore();
  store.seq += 1;
  const session: ChatSession = {
    id: mockId(`s${store.seq}`),
    title,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.sessions.unshift(session);
  return session;
}

export function updateSession(
  id: string,
  patch: Partial<Pick<ChatSession, 'title' | 'archived'>>,
): ChatSession | null {
  const store = sessionStore();
  const hit = store.sessions.find((s) => s.id === id);
  if (!hit) return null;
  Object.assign(hit, patch, { updatedAt: new Date().toISOString() });
  return hit;
}

export function deleteSession(id: string): boolean {
  const store = sessionStore();
  const before = store.sessions.length;
  store.sessions = store.sessions.filter((s) => s.id !== id);
  return store.sessions.length < before;
}
