# DevOps Agent 智能运维平台 - Server 架构解析

## 项目概览

基于 **Spring Boot 3.3.5 + Java 21 LTS** 的 Maven 多模块项目，server 作为 AI DevOps Agent 平台的后端，负责用户认证、WebSocket 对话通信、CI/CD 管理、系统监控，并通过 HTTP 调用外部 agent-engine 推理服务完成 AI 任务编排。

---

## 模块结构

```
server/
├── pom.xml                          # 根 POM（聚合）
├── devops-server/                   # 主应用模块
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/devopsagent/
│       │   ├── DevopsAgentApplication.java    # 启动入口
│       │   ├── agent/AgentOrchestrator.java   # Agent 编排
│       │   ├── auth/                          # 认证授权
│       │   │   ├── AuthController.java
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   └── SecurityConfig.java
│       │   ├── chat/ChatWebSocketHandler.java # WebSocket 聊天
│       │   ├── common/                        # 通用组件
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── RateLimit.java
│       │   ├── monitor/JvmMetricsService.java # JVM 监控
│       │   └── pipeline/PipelineController.java # CI/CD
│       ├── main/resources/
│       │   └── application.yml
│       └── test/java/com/devopsagent/
│           └── DevopsAgentApplicationTests.java
│
└── devops-tool-spring-boot-starter/ # 自定义 Spring Boot Starter
    ├── pom.xml
    └── src/main/
        ├── java/com/devopsagent/starter/
        │   ├── DevopsToolAutoConfiguration.java
        │   ├── DevopsToolProperties.java
        │   ├── client/GitHubApiClient.java
        │   └── health/DevopsToolHealthIndicator.java
        └── resources/META-INF/spring/
            └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

---

## 依赖流向

```
devops-server (主应用)
├── spring-boot-starter-web          # REST API
├── spring-boot-starter-websocket    # WebSocket 双向通信
├── spring-boot-starter-security     # Spring Security 6.3 认证鉴权
├── spring-boot-starter-validation   # 参数校验
├── spring-boot-starter-aop          # AOP（@RateLimit 限流）
├── spring-boot-starter-actuator     # 健康检查 / 指标监控
├── spring-boot-starter-data-redis   # Redis（Token 缓存 + 限流计数）
├── mybatis-plus-spring-boot3-starter # ORM
├── postgresql                       # PostgreSQL 驱动
├── jjwt-api/impl/jackson            # JWT 签发与校验
└── devops-tool-spring-boot-starter  # 自定义 Starter
    ├── GitHubApiClient              # GitHub Actions API
    ├── DockerApiClient              # Docker API（待实现）
    └── K8sApiClient                 # Kubernetes API（待实现）
```

---

## 核心架构设计

### 1. 单体应用 + 自定义 Starter 模式

- **devops-server** 为主应用单体，按功能领域划分子包
- **devops-tool-spring-boot-starter** 封装 GitHub/Docker/K8s 平台客户端，通过 Spring Boot 3.x 的 `AutoConfiguration.imports` SPI 机制自动装配
- 通过 `@ConditionalOnProperty(prefix = "devops.tools.xxx", name = "enabled", havingValue = "true")` 实现工具客户端的按需启用

### 2. 无状态 JWT 双 Token 认证

```
用户登录 → 签发 accessToken(2h) + refreshToken(7d, Redis 缓存)
    ├── JwtAuthenticationFilter (OncePerRequestFilter)
    │   └── 从 Authorization: Bearer <token> 解析 JWT → SecurityContextHolder
    ├── SecurityConfig (STATELESS 无状态会话)
    │   ├── /api/auth/** 放行
    │   └── 其余端点需认证
    └── @EnableMethodSecurity → @PreAuthorize("hasRole('ADMIN')")
        三种角色：ADMIN / DEVELOPER / VIEWER
```

### 3. WebSocket 双向通信 + Agent 编排

```
浏览器 ──WebSocket──> ChatWebSocketHandler
    ├── 消息持久化到 PostgreSQL
    ├── 交给 AgentOrchestrator 编排
    └── AgentOrchestrator
        ├── classifyIntent()   → 意图分类（规则 + LLM）
        └── dispatch()          → 调用外部 agent-engine
            ├── POST /code-review    (代码审查)
            ├── POST /deploy         (部署)
            ├── POST /diagnose       (故障诊断)
            └── POST /chat           (通用对话)
            SSE 事件流 ──桥接──> WebSocket 推回浏览器
```

### 4. Agent-Engine 分离（ADR-2）

Server **只做编排，不做推理**：

- **意图分类**：先关键词规则匹配，再 LLM 语义分类
- **任务调度**：按意图路由到 agent-engine 的 4 个契约端点
- **事件桥接**：agent-engine 的 SSE 流事件桥接到 WebSocket

### 5. 虚拟线程高并发

```yaml
spring.threads.virtual.enabled: true  # Java 21 虚拟线程
```

WebSocket 连接和资源等待场景下，虚拟线程自动释放平台线程，避免线程池耗尽，一行配置即享受高并发收益。

### 6. 安全设计

| 层面 | 措施 |
|------|------|
| 密钥管理 | 所有密钥通过环境变量注入 `${VAR:default}`，不硬编码 |
| 认证 | JWT + 双 Token + 刷新防并发竞态 |
| 授权 | Spring Security 方法级 `@PreAuthorize` RBAC |
| 限流 | `@RateLimit` 注解 + Redis 滑动窗口 + AOP 切面 |
| 日志 | 不打印 Token，不泄露内部细节 |
| 错误响应 | GlobalExceptionHandler 分类处理，统一格式，不暴露堆栈 |

### 7. 统一异常处理

```json
{ "code": 业务码, "message": "人类可读信息", "timestamp": "..." }
```

| 异常类型 | HTTP 状态码 |
|----------|------------|
| `MethodArgumentNotValidException` | 400 |
| `BadCredentialsException` | 401 |
| `AccessDeniedException` | 403 |
| `RateLimitExceededException` | 429 |
| `Exception` (兜底) | 500 |

---

## 关键组件详解

### AgentOrchestrator（Agent 编排器）

- **职责**：意图分类 + 任务调度
- **方法**：
  - `classifyIntent(String userMessage) → String` — 返回 `code_review | deploy | diagnose | general`
  - `dispatch(String intent, String sessionId, String userMessage) → void` — 调度到 agent-engine 并桥接 SSE

### ChatWebSocketHandler（WebSocket 聊天）

- **继承**：`TextWebSocketHandler`
- **连接管理**：`ConcurrentHashMap<String, WebSocketSession>` 维护在线会话
- **安全**：握手拦截器从 query param 取 JWT 校验
- **心跳**：30s Ping 保活
- **线程安全**：同一 session 的 `sendMessage` 加锁

### JwtAuthenticationFilter（JWT 过滤器）

- **继承**：`OncePerRequestFilter`
- **流程**：提取 `Authorization: Bearer` → 校验签名/过期 → 检查 Redis 黑名单 → 注入 `SecurityContextHolder`

### RateLimit（限流注解）

```java
@RateLimit(key = "login", limit = 10, windowSeconds = 300)  // 5分钟内最多10次
```

- **实现**：Redis 滑动窗口计数 + AOP 切面
- **典型场景**：登录接口 IP 限流

### PipelineController（CI/CD 流水线）

- `GET /api/pipeline/runs` — 最近 10 次构建
- `GET /api/pipeline/stats` — 近 30 天失败率统计
- `POST /api/pipeline/runs/{id}/rerun` — 重跑（需 ADMIN/DEVELOPER）
- **数据来源**：通过 Starter 的 `GitHubApiClient` 拉取 GitHub Actions

### JvmMetricsService（JVM 监控）

- **数据来源**：`ManagementFactory` 系列 MXBean
- **采集指标**：heap、memory pools、GC、threads

---

## devops-tool-spring-boot-starter 详解

### 什么是 Spring Boot Starter ？为什么用这个模式？

Starter 是 Spring Boot 的核心扩展机制——将一组相关功能打包为独立模块，通过 SPI
自动装配，使用者只需引入 Maven 坐标和少量配置即可开箱即用，无需关心底层 Bean 创建和依赖注入。

本项目的 `devops-tool-spring-boot-starter` 封装了 **GitHub / Docker / K8s 三大 DevOps 平台的 API 客户端**，
设计和行为类似（但不依赖）官方 `spring-boot-starter-data-redis` 等生产级 Starter，同时作为学习者
深入理解 Spring Boot 3.x 自动装配原理的完整范例。

**关键设计目标（F1.8）：**

- **零代码侵入**：主应用 `devops-server` 只需依赖此 Starter + 配置 `devops.tools.*`，无需手动 new 客户端
- **独立可发布**：可单独 `mvn deploy` 到私有 Maven 仓库，其他微服务也能复用
- **条件装配**：通过 `enabled` 开关按需创建 Bean，不用的工具零开销
- **Fail-Fast**：若 `enabled=true` 但 token 为空，启动时立即报错并给出明确提示（而非运行时 NPE）

---

### 实现原理：Spring Boot 3.x 自动装配 SPI

整个 Starter 通过一条 SPI 声明串联启动（替代 Spring Boot 2.x 的 `spring.factories`）：

```
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
      ↓ 启动时 Spring Boot 自动加载该文件中声明的类
DevopsToolAutoConfiguration（@AutoConfiguration）
      ↓ @EnableConfigurationProperties 绑定配置
DevopsToolProperties（@ConfigurationProperties(prefix = "devops.tools")）
      ↓ 读取 application.yml → 构造属性对象
@ConditionalOnProperty 条件判断 → 条件满足才创建 Bean
      ↓
GitHubApiClient / DockerApiClient / K8sApiClient
```

**四段式装配链路：**

| 环节 | 说明 |
|------|------|
| SPI 声明 | `AutoConfiguration.imports` 文件告知 Spring Boot 加载配置类 |
| 配置绑定 | `@ConfigurationProperties` 将 YAML 映射到强类型 Java 对象 |
| 条件装配 | `@ConditionalOnProperty(prefix = "xxx", name = "enabled", havingValue = "true")` 决定是否创建 Bean |
| Fail-Fast | Bean 工厂方法内校验必填字段，不满足则抛出明确异常阻止启动 |

---

### 源码逐类分析

#### 1. DevopsToolAutoConfiguration —— 自动配置入口

```java
@AutoConfiguration                                          // Spring Boot 3.x 新注解，语义同 @Configuration
@EnableConfigurationProperties(DevopsToolProperties.class)  // 绑定 YAML 配置到 Java 对象
public class DevopsToolAutoConfiguration {

  // @Bean
  // @ConditionalOnProperty(prefix = "devops.tools.github", name = "enabled", havingValue = "true")
  // GitHubApiClient gitHubApiClient(DevopsToolProperties properties) { ... }

  // TODO: DockerApiClient / K8sApiClient 同理
}
```

**要点**：
- `@AutoConfiguration` 是 Spring Boot 3.x 引入的，比 `@Configuration` 语义更明确
- 三个 `@Bean` 方法各带独立的 `@ConditionalOnProperty`，允许只启用 GitHub 而关闭 Docker/K8s
- Bean 创建时从 `DevopsToolProperties` 注入构造参数，同时校验 token 等必填项

#### 2. DevopsToolProperties —— 配置属性绑定

```java
@ConfigurationProperties(prefix = "devops.tools")
public class DevopsToolProperties {
    private final GitHub github = new GitHub();     // 默认实例，避免 getter 返回 null
    private final Docker docker = new Docker();
    private final K8s   k8s   = new K8s();
    // ...
}
```

**三层嵌套内部类设计：**

| 内部类 | 属性 | 默认值 |
|--------|------|--------|
| `GitHub` | `enabled`, `token`, `repository` | `enabled=false` |
| `Docker` | `enabled`, `host` | `enabled=false`, `host=unix:///var/run/docker.sock` |
| `K8s` | `enabled`, `kubeconfig` | `enabled=false`, `kubeconfig=~/.kube/config` |

**安全设计**：`token` 字段无默认值，强制从环境变量注入，遵循"密钥不硬编码"红线。

**IDE 自动补全**：`spring-boot-configuration-processor` 依赖（`optional=true`）会在编译期生成
`spring-configuration-metadata.json`，使 IDE 在编辑 `application.yml` 时自动提示 `devops.tools.github.*` 等属性。

#### 3. GitHubApiClient —— GitHub REST API 客户端

```java
public class GitHubApiClient {
    private final String token;
    private final String repository;

    public GitHubApiClient(String token, String repository) {
        this.token = token;
        this.repository = repository;
    }
    // ...
}
```

**三个对外能力：**

| 方法 | 对应需求 | GitHub API |
|------|----------|------------|
| `fetchPullRequestDiff(int pullNumber) → String` | F1.3 代码审查 | `GET /repos/{repo}/pulls/{n}` + `Accept: vnd.github.v3.diff` |
| `listWorkflowRuns(int limit) → Object` | F1.7 构建列表 | `GET /repos/{repo}/actions/runs?per_page={limit}` |
| `rerunWorkflow(String runId) → void` | F1.7 构建重跑 | `POST /repos/{repo}/actions/runs/{id}/rerun` |

**学习者实现要点**：
- 使用 Spring 6 的 `RestClient`（比 `RestTemplate` 更现代的流式 API）
- 鉴权：`Authorization: Bearer <token>` 请求头
- 分页：`per_page=100` + `Link` 响应头遍历
- 限流：GitHub API 5000 次/小时，监控 `X-RateLimit-Remaining` 响应头，失败时指数退避重试
- 安全：token 禁止出现在日志中

#### 4. DevopsToolHealthIndicator —— 健康探测

```java
public class DevopsToolHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // 遍历已装配的客户端，逐一探测连通性
        // 任一不可达 → Health.down().withDetail(...)
        // 全部可达   → Health.up()
    }
}
```

**关键约束：**
- 探测超时 ≤ 2s，避免拖垮 `/actuator/health` 响应
- 聚合结果在 Actuator 健康端点中暴露为 `"devopsTool"` 节点
- 仅探测已启用的工具客户端（未启用的不计入）

---

### 配置示例

```yaml
devops:
  tools:
    # ---- GitHub ----
    github:
      enabled: true
      token: ${GITHUB_TOKEN}              # 从环境变量注入，不硬编码
      repository: owner/repo

    # ---- Docker（暂未启用）----
    docker:
      enabled: false
      host: unix:///var/run/docker.sock   # 支持 tcp://localhost:2375 远程 Docker

    # ---- Kubernetes（暂未启用）----
    k8s:
      enabled: false
      kubeconfig: ~/.kube/config          # 默认读取本地 kubeconfig
```

---

### 与 devops-server 的集成方式

```
devops-server（依赖方）
    │
    ├── pom.xml 中声明依赖 devops-tool-spring-boot-starter
    │
    ├── application.yml 中配置 devops.tools.github.enabled=true + token
    │
    └── PipelineController 中注入 GitHubApiClient：
        @Autowired
        private GitHubApiClient gitHubApiClient;
            ↓
        gitHubApiClient.listWorkflowRuns(10)
        gitHubApiClient.rerunWorkflow(runId)
```

Starter 对主应用完全透明——`PipelineController` 只需 `@Autowired` 注入 `GitHubApiClient` 即可调用，
无需关心它是如何被创建的、token 是从哪来的。

---

### 扩展指南：添加新工具客户端

如需对接 GitLab / Jenkins 等新平台，遵循如下模式即可：

1. 在 `DevopsToolProperties` 中添加对应内部类（如 `GitLab`）
2. 在 `DevopsToolAutoConfiguration` 中添加带 `@ConditionalOnProperty` 的 `@Bean` 方法
3. 在同级 `client/` 包下实现客户端类（如 `GitLabApiClient`）
4. 在 `DevopsToolHealthIndicator` 中添加对应连通性探测逻辑

---

## 外部系统依赖

```
┌─────────────────────────────────────────────┐
│                  devops-server               │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │   Auth   │  │  Agent   │  │ Pipeline  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │             │              │        │
└───────┼─────────────┼──────────────┼────────┘
        │             │              │
   ┌────▼────┐   ┌────▼─────┐  ┌───▼────────┐
   │  Redis  │   │ agent-   │  │  GitHub    │
   │  Token  │   │ engine   │  │  Actions   │
   │  缓存   │   │ :8000    │  │   API      │
   │  限流   │   │ (推理服务) │  │            │
   └─────────┘   └──────────┘  └────────────┘

   ┌──────────┐
   │PostgreSQL│
   │  持久化   │
   └──────────┘
```

---

## 技术栈总结

| 类别 | 技术 |
|------|------|
| 语言 | Java 21 LTS |
| 框架 | Spring Boot 3.3.5 |
| 认证 | Spring Security 6.3 + JWT + RBAC |
| 通信 | REST API + WebSocket + SSE 桥接 |
| ORM | MyBatis-Plus 3.5.7 |
| 数据库 | PostgreSQL |
| 缓存 | Redis（Token + 限流） |
| 监控 | Micrometer + Spring Actuator |
| 虚拟线程 | Java 21 Virtual Threads |
| 代码风格 | Spotless + Google Java Format |
| AI 引擎 | 外部 agent-engine（HTTP 契约调用） |
| 构建 | Maven 多模块聚合 |
