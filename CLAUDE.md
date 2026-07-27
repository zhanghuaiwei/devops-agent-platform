<!-- 本文由 AI 生成,是 AI 编程助手(Claude Code)在本仓库工作时的项目级约束文件 -->
# CLAUDE.md — 项目级 AI 编程约束

> 本文件会被 Claude Code 自动加载。你在本仓库生成的每一行代码都必须遵守以下约定。

## 1. 项目快照

- **名称**:DevOps Agent 智能运维平台(学习型生产级项目)
- **三端结构**:`web/`(Next.js 14 全功能 + mock 数据层)、`server/`(Spring Boot 3.3 单体 + 自定义 Starter)、`agent-engine/`(FastAPI + LangChain ReAct Agent)
- **版本红线**(不得擅自升级/降级):Java 21 / Spring Boot 3.3.x / MyBatis-Plus 3.5.7 / Python 3.12 / LangChain 0.3.x / FastAPI 0.115.x / Next.js 14.2.x / React 18.3.x / Tailwind 3.4.x / SWR 2.2.x / PostgreSQL 16 / Redis 7.2

## 2. 代码边界(必须遵守)

| 边界 | 规则 |
|------|------|
| Web → Server | 只允许通过 `/api/**` REST + WebSocket 调用;禁止在组件里直接写 SQL/HTTP 客户端逻辑 |
| Server → Agent Engine | 只允许走 `agent-engine` 暴露的 4 个 HTTP 端点(`/api/agent/chat|code-review|deploy|diagnose`);禁止 Server 直接 import Python 逻辑或直连 Agent 的数据源 |
| 包结构 | Server 代码必须落在 `com.devopsagent.{auth,chat,agent,pipeline,monitor,common}` 之一;跨包依赖只许上层调下层(auth/chat/agent/pipeline/monitor → common) |
| mock 边界 | Web 端所有 mock 数据只允许出现在 `web/src/mocks/`;业务组件禁止内联 mock 常量 |
| 配置 | 任何密钥/令牌只许走环境变量;代码、注释、文档中禁止出现真实密钥 |

## 3. 代码规范摘要(详见 .pre-commit-config.yaml 与各端 ESLint/Checkstyle/ruff 配置)

- **Java**:Google Java Format;类必须有 Javadoc;禁止 `System.out.println`(用 SLF4J);禁止吞异常的空 catch
- **Python**:ruff(lint+format);全部函数必须有类型注解;禁止 `print()`(用 structlog);异步 IO 优先
- **TypeScript**:ESLint + Prettier;禁止 `any`(用 `unknown` + 类型收窄);组件必须声明 Props 接口;服务端逻辑只在 Server Component / API Route
- **所有 AI 生成内容必须带注释**:文件头注明 AI 生成,关键逻辑写"为什么这么做"而非复述代码

## 4. 安全红线

1. 禁止硬编码密钥、Token、连接串(CI 会用 gitleaks 扫描)
2. SQL 只允许走 MyBatis-Plus 参数绑定,禁止字符串拼接
3. Web 端渲染 Markdown 必须经过 sanitize(防 XSS)
4. 新增依赖必须说明理由,禁止引入 2 年未维护的包

## 5. 测试要求

- 新功能必须带测试:Java(JUnit 5 + Mockito)、Python(pytest)、Web(Vitest + Testing Library)
- 覆盖率门槛:核心包(auth/agent)≥ 70%,其余 ≥ 50%
- 测试命名:`方法名_场景_期望结果`

## 6. 常用命令

```bash
# Web
cd web && npm run dev / npm run lint / npm run test / npm run build
# Server(骨架实施后)
cd server && ./mvnw verify
# Agent Engine(骨架实施后)
cd agent-engine && pytest && ruff check .
# 提交前全量检查
pre-commit run --all-files
```
