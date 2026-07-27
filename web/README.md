<!-- AI 生成：项目说明文档 -->

# DevOps Agent 智能运维平台（前端）

基于 Next.js 14 的智能运维平台前端。后端 Java/Python 尚未就绪，全部功能由
**Next.js API Routes + mock 数据层** 驱动：页面只请求 `/api/**` 相对路径，
Route Handlers 从 `src/mocks/` 取数返回 JSON。

## 启动方式

```bash
npm install        # 安装依赖（Node 22）
npm run dev        # 开发模式，访问 http://localhost:3000
npm run lint       # ESLint 检查
npm run test -- --run   # Vitest 单元测试
npm run build      # 生产构建
npm run start      # 生产模式启动
```

## Mock 账号

| 邮箱 | 密码 | 角色 |
| --- | --- | --- |
| admin@devops.local | admin123 | ADMIN（管理员） |
| dev@devops.local | dev123 | DEVELOPER（开发者） |
| viewer@devops.local | viewer123 | VIEWER（只读用户） |

登录成功返回 mock JWT（accessToken 2h + refreshToken 7d），存 localStorage。
同一邮箱连续 5 次密码错误，API 返回 429 临时锁定（路由内存计数）。

## 页面清单

| 路由 | 路由模式 | 功能 |
| --- | --- | --- |
| /login | App Router | 登录/注册双 Tab，mock 账号提示卡，未登录守卫重定向 |
| /chat | App Router | 核心页：会话列表（新建/重命名/删除/归档/分页加载更多）、SSE 流式回答、thought/action/observation 可折叠步骤卡片、意图徽标、Markdown + 代码复制、导出 .md、4 个快捷入口 |
| /review | App Router | PR 审查：分级问题卡片（严重/高危/中危/低危）、verdict + ECharts 饼图、历史记录可展开 |
| /dashboard | Pages Router | 3s 轮询：JVM 堆内存堆叠柱状、GC 双线折线、线程仪表盘、死锁状态卡、Agent 调用统计表、CPU/内存 |
| /pipeline | Pages Router | 最近 10 次构建（彩色徽章）、Jobs→Steps 耗时横向条形图、近 30 天失败率折线、重新运行 + 乐观更新 |

## Mock 说明

- 所有 mock 数据集中在 `src/mocks/`：`auth.ts`（账号与令牌）、`chat.ts`（会话 + 4 套流式剧本）、
  `monitor.ts`（随机游走指标）、`pipeline.ts`（构建与统计）、`review.ts`（报告与历史）、
  `utils.ts`（`sleep` 模拟延迟、`getStore` 基于 globalThis 的跨路由内存态）。
- 意图分类在 `/api/chat/send` 内按关键词完成：`code_review / deploy / diagnose / general`，
  对应流式剧本由 `/api/chat/stream` 用 ReadableStream 模拟 SSE 逐事件推送。
- 监控接口每次返回随机波动数据，配合前端 SWR `refreshInterval: 3000` 形成实时效果。
- 重新运行构建会把该记录重置为 `running` 并置顶，前端用 SWR `mutate` 乐观更新。

## 目录结构

```
web/
├── app/                        # App Router
│   ├── layout.tsx              # 根布局（全局样式 + highlight.js 主题）
│   ├── page.tsx                # 首页重定向 /chat
│   ├── (auth)/login/           # 登录/注册页
│   ├── (main)/                 # 主功能区（AuthGuard + AppShell 布局）
│   │   ├── chat/               # Chat 核心页
│   │   └── review/             # 代码审查页
│   └── api/                    # API Routes（全部从 src/mocks 取数）
│       ├── auth/login/
│       ├── chat/{send,stream,sessions,sessions/[id]}/
│       ├── review/{submit,history}/
│       ├── monitor/{jvm,system}/
│       └── pipeline/{runs,runs/[id]/rerun,stats}/
├── pages/                      # Pages Router
│   ├── _app.tsx                # pages 入口（注入全局样式）
│   ├── dashboard.tsx           # 监控大盘
│   └── pipeline.tsx            # 流水线
├── src/
│   ├── components/             # AppShell / AuthGuard / charts/Chart / chat / review
│   ├── lib/                    # fetcher（SWR）、auth（localStorage）
│   ├── mocks/                  # 全部 mock 数据（唯一允许放 mock 的位置）
│   ├── styles/globals.css
│   └── types/                  # 集中类型定义
├── __tests__/                  # Vitest 测试（登录、fetcher、审查报告）
└── 配置文件（next/tailwind/tsconfig/eslint/prettier/vitest）
```

## 双路由混合说明

`pages/` 与 `app/` 共存是已知妥协：`AppShell` 同时被 `app/(main)/layout.tsx` 与
`pages/dashboard.tsx`、`pages/pipeline.tsx` 引用。因 `usePathname`（app）与
`useRouter`（pages）互不兼容，导航激活态与未登录跳转统一用 `window.location`
实现（见 `src/components/AppShell.tsx`、`src/components/AuthGuard.tsx` 头部注释）。
