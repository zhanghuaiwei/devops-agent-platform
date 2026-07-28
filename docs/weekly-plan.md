<!-- 本文由 AI 生成，作为项目周计划与学习路线；当与 docs/ 下具体教程有出入时，以教程为准 -->
# 每周工作计划与学习内容

> **当前阶段**:W3~W4 Server 端骨架实施  
> **已完成**:W1~W2 Web 端全功能 + 工程化基座  
> **总计剩余**:14 个教程 | 19 个文件 | 约 62 处 `TODO(学习者)` 待手写

---

## 总体路线图

```
W1~W2 ✅  Web 端全功能(mock) + 工程化
W3~W4 🔥  Server 端骨架实施  ← 当前位置
W5        Agent 引擎实施
W6        DevOps 联调与部署
```

---

## 第 1 周（W3 前半）：Server 启动 + 认证

> 焦点：让 Server 可启动、可认证、可鉴权

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/server-guide/01-环境准备与项目初始化.md` | Java 21 安装 / Maven 配置 / `mvn spring-boot:run` 启动 | 2h | Server 启动成功 |
| Tue | `docs/server-guide/02-Maven多模块与启动验证.md` | 多模块结构理解 / starter 依赖 / actuator 健康检查 | 2h | 两模块编译通过 |
| Wed | `docs/server-guide/03-SpringSecurity-JWT.md`（上） | SecurityFilterChain / BCrypt / JWT 签发 | 2.5h | `POST /api/auth/login` |
| Thu | `docs/server-guide/03-SpringSecurity-JWT.md`（下） | JwtAuthenticationFilter / 认证上下文 / 权限注解 | 2.5h | 过滤器完成 + 测试 |
| Fri | 回顾 + Code Review | `pre-commit run --all-files` / CR 自查 / 笔记整理 | 1.5h | 周总结 |

### 本周学习清单

| 主题 | 关键概念 | 何时学 |
|------|---------|--------|
| Java 21 新特性 | record / sealed class / virtual threads / pattern matching | Mon 动手前 |
| Maven 多模块 | `dependencyManagement` vs `dependencies` / monorepo 版本管理 | Tue |
| Spring Boot Starter | `AutoConfiguration.imports` / `@ConditionalOnClass` / `@EnableConfigurationProperties` | Tue |
| Spring Security 6.x | Lambda DSL / SecurityFilterChain / BCrypt vs argon2 | Wed |
| JWT | Header.Payload.Signature / HMAC vs RSA / Access vs Refresh Token | Wed~Thu |
| SecurityContext | `OncePerRequestFilter` / `SecurityContextHolder` / `ThreadLocal` | Thu |
| 方法级权限 | `@PreAuthorize` / `@Secured` | Thu |

**学习方式**:动手项目中遇到时查，不是课前全部读完。看官方文档 > 看 AI 解释 > 写代码验证。

### 本周概念图谱

```
Maven 多模块
  ├── devops-server ──依赖──▶ devops-tool-spring-boot-starter
  │                              └── AutoConfiguration
  └── devops-server 自身
       ├── SecurityConfig ──▶ SecurityFilterChain
       ├── AuthController ──▶ JWT 签发
       ├── JwtAuthenticationFilter ──▶ OncePerRequestFilter
       └── GlobalExceptionHandler ──▶ 401/403 处理
```

### 本周工程化检查

| 检查项 | 方式 |
|--------|------|
| `TODO(学习者)` 区域仅讲解不代写 | AI 遵守 `workflow.md` |
| 版本红线 | 对照 `.ai/rules/project.md` |
| 代码边界 | `docs/architecture.md` API 契约表 |
| 提交规范 | `type(server): subject` + `pre-commit` 通过 |

---

## 第 2 周（W3 后半→W4 前半）：实时通信 + 持久化

> 焦点：WebSocket 双向通信 / 数据库 CRUD / 监控

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/server-guide/04-WebSocket与Agent编排.md`（上） | WebSocket 握手 / STOMP 协议 / 消息模型 | 2.5h | WebSocket 连接可建立 |
| Tue | `docs/server-guide/04-WebSocket与Agent编排.md`（下） | AgentOrchestrator 编排 / 转发到 agent-engine | 2.5h | 端到端消息通路 |
| Wed | `docs/server-guide/05-MyBatisPlus与数据库.md`（上） | DDL 编写 / 实体映射 / BaseMapper | 2h | 四张表建好 + POJO |
| Thu | `docs/server-guide/05-MyBatisPlus与数据库.md`（下） | Service 层 / 分页 / 逻辑删除 / 乐观锁 | 2h | CRUD 可用 |
| Fri | 回顾 + 集成测试 | 联调 Web ↔ Server ↔ DB / 修复边界问题 | 1.5h | 周总结 |

### 本周学习清单

| 主题 | 关键概念 | 何时学 |
|------|---------|--------|
| WebSocket | 协议升级 / STOMP / 心跳 / 断线重连 vs SSE 何时用哪种 | Mon |
| Session 管理 | WebSocket session 生命周期 / 心跳超时 / 并发连接 | Mon~Tue |
| Agent 编排 | 请求路由 / 超时控制 / 重试 / 降级策略 | Tue |
| 数据库设计 | 范式 vs 反范式 / 索引策略 / DDL 编写 | Wed |
| MyBatis-Plus | BaseMapper / IService / 分页插件 / 逻辑删除 | Wed~Thu |
| PostgreSQL | 连接池(HikariCP) / JSONB 类型 / 事务隔离 | Wed~Thu |
| 乐观锁 | `@Version` 注解 / 版本号 vs 时间戳 | Thu |

### 本周概念图谱

```
Web 客户端
  │  WebSocket (STOMP over SockJS)
  ▼
devops-server
  ├── ChatWebSocketHandler ──▶ 消息路由
  ├── AgentOrchestrator ──HTTP──▶ agent-engine
  ├── SecurityConfig ──▶ WebSocket 安全（复用 JWT）
  │
  └── MyBatis-Plus
       ├── users 表 ──▶ AuthController 配套
       ├── chat_sessions ──▶ 对话历史
       ├── chat_messages ──▶ 消息持久化
       └── review_reports ──▶ 审查报告
```

---

## 第 3 周（W4 后半）：监控 + Starter + 回顾

> 焦点：生产级质量（监控 / 自愈 / 可观测）

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/server-guide/06-JMX监控与Actuator.md`（上） | Actuator 端点 / 自定义 HealthIndicator / InfoContributor | 2h | `/actuator/health` 可用 |
| Tue | `docs/server-guide/06-JMX监控与Actuator.md`（下） | JMX MBean / Prometheus 指标 / Micrometer | 2h | 指标导出可用 |
| Wed | `docs/server-guide/07-自定义Starter.md` | DevopsToolAutoConfiguration 实现 / 条件装配 / properties 映射 | 2.5h | Starter 模块完成 |
| Thu | Server 端集成测试 | 端到端测试 / 边界场景 / 异常路径 | 2.5h | 测试报告 |
| Fri | Server 端回顾 + 文档 | `pre-commit` / CR 清单 / 补全 doc 注释 | 1.5h | W3~W4 总结 |

### 本周学习清单

| 主题 | 关键概念 | 何时学 |
|------|---------|--------|
| Actuator | 端点安全 / `management.endpoints.web.exposure` / 自定义端点 | Mon |
| Micrometer | `MeterRegistry` / Timer / Counter / Gauge | Mon~Tue |
| JMX | MBean 规范 / `@ManagedResource` / JConsole 实操 | Tue |
| Prometheus 格式 | histogram vs summary / label 设计 / 指标命名规范 | Tue |
| Spring Starter | AutoConfiguration 原理 / `spring.factories` 演进到 `.imports` | Wed |
| 条件装配 | `@ConditionalOnMissingBean` / `@ConditionalOnProperty` / 装配顺序 | Wed |
| 健康检查 | Kubernetes liveness vs readiness probe | Wed~Thu |

### 本周概念图谱

```
devops-tool-spring-boot-starter
  ├── DevopsToolAutoConfiguration ──▶ 条件装配
  ├── DevopsToolProperties ──▶ @ConfigurationProperties
  ├── GitHubApiClient ──▶ 外部 API 封装
  └── DevopsToolHealthIndicator ──▶ 自定义健康检查

devops-server 可观测性
  ├── /actuator/health ──▶ 含 DevopsToolHealthIndicator
  ├── /actuator/metrics ──▶ Prometheus 拉取
  └── JMX MBean ──▶ JConsole/JVisualVM 实时查看
```

---

## 第 4 周（W5）：Agent 引擎实施

> 焦点：Python / FastAPI / LangChain / ReAct Agent / SSE 流式

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/agent-guide/01-环境准备与最小启动.md` | Python 3.12 / venv / uvicorn / `pyproject.toml` | 1.5h | FastAPI 可启动 |
| Tue | `docs/agent-guide/02-FastAPI骨架.md` | 路由设计 / Pydantic schemas / 中间件 / 异常处理 | 2h | API 骨架就绪 |
| Wed | `docs/agent-guide/03-LangChain-ReAct-Agent.md` | ReAct 范式 / ChatOpenAI / AgentExecutor / 工具注册 | 2.5h | Agent 推理链路可运行 |
| Thu | `docs/agent-guide/04-自定义Tool开发.md` | Docker 工具 / GitHub 工具 / 运维工具 / Tool 接口 | 2.5h | 3 个 Tool 实现 |
| Fri | `docs/agent-guide/05-SSE流式输出.md`（上） | SSE 协议 / LangChain Callbacks / AstreamEvents | 2h | 流式输出雏形 |

### 本周学习清单

| 主题 | 关键概念 | 何时学 |
|------|---------|--------|
| Python 3.12 | `pyproject.toml` / `uv` 包管理 / type hints | Mon |
| FastAPI 进阶 | 依赖注入 / BackgroundTasks / lifespan | Mon~Tue |
| Pydantic v2 | `model_validate` / computed fields / discriminated unions | Tue |
| LangChain ReAct | Thought→Action→Observation 循环 / Prompt 模板 | Wed |
| Agent 类型 | ReAct vs OpenAI Functions vs Plan-and-Execute | Wed |
| LangChain Tool | `@tool` 装饰器 / Tool 描述最佳实践 / 错误处理 | Thu |
| SSE | `text/event-stream` / `data:` / `event:` 字段 / fetch EventSource | Fri |

### 本周概念图谱

```
agent-engine (FastAPI)
  ├── POST /api/agent/chat ──▶ ChatRequest → AgentResponse
  ├── GET /api/agent/chat/{id}/stream ──▶ SSE 流式
  │
  └── ReAct Agent (LangChain)
       ├── ChatOpenAI (LLM 调用)
       ├── AgentExecutor (ReAct 循环)
       └── Tools
            ├── docker_tools ──▶ 容器管理
            ├── github_tools ──▶ PR / Issue 查询
            └── ops_tools ──▶ 日志 / 监控查询
```

---

## 第 5 周（W5 后半→W6 前半）：SSE 完善 + 测试 + DevOps

> 焦点：流式联调 / Agent 测试 / 容器化部署

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/agent-guide/05-SSE流式输出.md`（下） | 错误处理 / 中断 / Token 用量追踪 | 2h | SSE 完整链路 |
| Tue | `docs/agent-guide/06-测试与质量.md` | pytest / Agent mock / Tool 单元测试 / 集成测试 | 2.5h | 测试覆盖 |
| Wed | `docs/devops-guide/01-Docker与Compose.md` | Dockerfile / Compose 编排 / PostgreSQL + Redis | 2h | `docker compose up` 一键启动 |
| Thu | `docs/devops-guide/02-Nginx反向代理.md` | Nginx 配置 / WebSocket 代理 / 静态资源 | 2h | 反向代理可用 |
| Fri | 三端联调 1 | Web → Server → Agent Engine 链调通 | 2h | 首个对话链路 |

### 本周学习清单

| 主题 | 关键概念 |
|------|---------|
| Token 管理 | ChatOpenAI 回调 / TokenUsage / 成本估算 |
| pytest 技巧 | fixture / parametrize / mock.patch / conftest |
| Docker 多阶段构建 | builder→runner / 镜像瘦身 / .dockerignore |
| Docker Compose | depends_on + healthcheck / secrets / profiles |
| Nginx | `proxy_pass` / `proxy_set_header` / WebSocket Upgrade / `try_files` |

---

## 第 6 周（W6 后半）：CI/CD + 上线

> 焦点：自动化部署 / 监控 / 发布

| 天数 | 教程 | 核心任务 | 预计 | 产出物 |
|------|------|---------|------|--------|
| Mon | `docs/devops-guide/03-GitHubActions-CICD.md`（上） | Docker 镜像构建 / 推送到 GHCR | 2h | CI 可构建镜像 |
| Tue | `docs/devops-guide/03-GitHubActions-CICD.md`（下） | 自动部署 / 环境变量管理 / 密钥安全 | 2h | CD 流水线 |
| Wed | 三端联调 2 | 全场景测试 / 边界 Case / 性能摸底 | 2.5h | 联调报告 |
| Thu | 文档 + 录屏 | 更新 README 截图 / API 文档 / 部署指南 | 2h | 项目文档完整 |
| Fri | 最终 Review | 代码质量 / 安全审计 / 路线图复盘 | 1.5h | 项目发布 |

### 本周学习清单

| 主题 | 关键概念 |
|------|---------|
| GitHub Actions 进阶 | matrix build / cache / concurrency / environments |
| Docker 最佳实践 | 最小基础镜像 / layer 缓存 / 安全扫描 |
| 环境管理 | `.env` / 12-factor / secrets vs config |
| 可观测性 | logs / metrics / traces 三支柱 |

---

## 📊 学习量统计

| 阶段 | 周数 | 教程数 | TODO(学习者) 文件数 | TODO 数量 | 每日平均 |
|------|------|--------|---------------------|-----------|----------|
| Server 端 | 第 1~3 周 | 7 | 12 | ~38 | 1.5~2.5h |
| Agent 引擎 | 第 4~5 周 | 6 | 7 | ~24 | 2~2.5h |
| DevOps | 第 5~6 周 | 3 | — | — | 2h |
| **合计** | **6 周** | **16** | **19** | **~62** | **~2h/天** |

---

## 🔧 全周期工程化检查清单

每次提交前对照：

- [ ] `pre-commit run --all-files` 通过
- [ ] 未触及版本红线（`.ai/rules/project.md`）
- [ ] 未违反代码边界（`.ai/rules/boundaries.md`）
- [ ] 新增依赖有正当理由且非 GPL 许可证
- [ ] `TODO(学习者)` 区域由学习者亲手实现，AI 仅讲解
- [ ] 提交信息符合 Conventional Commits

---

## 📌 AI 协作约定（全周期遵守）

1. **只讲不写**:`server/` 与 `agent-engine/` 中带 `TODO(学习者)` 的代码，AI 只讲解思路不代写，除非学习者明确说"帮我实现"
2. **先问后写**:需求模糊时先列 2~4 个方案供选择，不猜
3. **提交即注释**:AI 生成的文件头部标注来源，关键决策写"为什么"
4. **中文交流**:对话用中文，代码注释用中文

---

## 📚 课外延伸阅读（按兴趣选读，非必做）

| 阶段 | 推荐阅读 | 适合时机 |
|------|---------|----------|
| W3 | *Spring Boot in Action* (第 5~7 章) | 第 1 周周末 |
| W4 | MyBatis-Plus 官方文档——插件与拦截器 | 第 2 周周末 |
| W5 | LangChain 官方 Cookbook——Agent 章节 | 第 4 周周末 |
| W5 | *Building Microservices* (Sam Newman)——单体 vs 微服务决策 | 第 4 周 |
| W6 | *The Twelve-Factor App* | 第 5 周 |
| 全程 | *Clean Code* / *重构* | 持续 |
