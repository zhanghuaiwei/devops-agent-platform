<!-- AI 生成:服务端搭建教程 04 —— WebSocket 会话管理与 Agent 编排 -->
# 04 WebSocket 与 Agent 编排(F1.2)

> 前置:完成 03。对应功能点:F1.2 智能对话 Agent 的服务端半边。

## 学习目标

- 手写 WebSocket 端点:握手鉴权、会话注册表、心跳
- 实现 AgentOrchestrator:意图分类 + SSE→WS 桥接
- 理解为什么选虚拟线程扛 Agent 长任务

## 一、WebSocket 协议认知

| 特性 | WebSocket | SSE | 轮询 |
|------|-----------|-----|------|
| 方向 | 双向 | 服务端→客户端 | 客户端拉 |
| 适用 | 对话(用户发 + 服务端推) | 纯推送 | 低频 |

ADR-3 选了 WebSocket;但注意 **server → agent-engine 之间是 SSE**(FastAPI 推推理事件给 Java),所以你要做一次协议桥接,这是本课最有价值的部分。

## 二、实施步骤

### 1. 注册端点

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(chatWebSocketHandler, "/ws/chat")
            .addInterceptors(jwtHandshakeInterceptor)  // query param 取 token 校验
            .setAllowedOrigins("http://localhost:3000"); // 生产收紧为真实域名
  }
}
```

安全要点:WebSocket 握手是 HTTP,但浏览器 WS API 不能自定义 Header,所以 token 走 query param;**拦截器里校验失败必须拒绝握手**,否则等于开了个无鉴权通道。

### 2. 会话注册表(骨架 handleTextMessage 里用)

```java
private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
```

两个并发坑(面试高频):
1. `WebSocketSession.sendMessage` **非线程安全** —— Agent 异步线程推送 + 心跳线程推送会并发,必须按 session 加锁
2. 连接断开必须从注册表移除,否则内存泄漏

### 3. 意图分类(AgentOrchestrator.classifyIntent)

两级策略:

```text
关键词命中("审查/PR"→code_review,"部署/上线"→deploy,"报错/故障"→diagnose)
    ↓ 未命中
调 agent-engine 的 LLM 语义分类(慢但准;有成本,做好超时与降级为 general)
```

思考题(写在代码注释里):为什么不能只用关键词?——"这个 PR 部署后挂了"同时命中两类。

### 4. SSE → WebSocket 桥接(dispatch)

流程:Java 用 WebClient/RestClient 调 agent-engine 的 SSE 端点 → 逐事件读流 → 按 docs/architecture.md §3 的协议原样转发给 WS 客户端 → `final` 事件时落库。

**必须异步**:Agent 推理可达分钟级。用 `Thread.startVirtualThread(...)`(Java 21 虚拟线程,这正是选 21 的理由)或 `@Async`。

### 5. 消息持久化

`chat_messages` 表存 role/agent/content/events_json(推理步骤 JSONB)。导出 Markdown(F1.2)就是读这张表拼装。

## 三、验收清单

- [ ] 无 token 的 WS 握手被拒绝
- [ ] 前端发"帮我审查这个 PR" → 收到 intent=code_review 徽标事件
- [ ] 逐步收到 thought/action/observation/token 事件,顺序正确
- [ ] 断开重连后旧 session 已清理(日志可见)
- [ ] agent-engine 不可达时,WS 收到 error 事件而非连接被掐断

## 四、性能验证(JVM 监控的素材)

用 `websocat` 或前端开 20 个并发会话,观察 Dashboard(F1.6)的线程数 —— 对比虚拟线程开/关的差异,把数据写进你的学习笔记。
