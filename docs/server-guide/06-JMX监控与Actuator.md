<!-- AI 生成:服务端搭建教程 06 —— JMX + Micrometer + Actuator(F1.6) -->
# 06 JMX 监控与 Actuator(F1.6)

> 前置:完成 02。对应功能点:F1.6 Dashboard 监控面板的服务端数据来源。

## 学习目标

- 用 JMX MXBean 采集 JVM 指标(堆/GC/线程/死锁)
- 用 Micrometer 自定义 Agent 调用指标
- 理解 Actuator 端点暴露的安全边界

## 一、JMX 采集(JvmMetricsService 骨架的填充指南)

```java
// 堆内存
MemoryMXBean memory = ManagementFactory.getMemoryMXBean();
MemoryUsage heap = memory.getHeapMemoryUsage();   // used/committed/max

// Eden/Old/Metaspace 分区
for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
  // 按 pool.getName() 归类:"PS Eden Space"/"G1 Eden Space" → eden 等
  // 注意:不同 GC 收集器池名不同!用 contains("Eden") 等模糊匹配而非精确等值
}

// GC 统计(Young/Full 区分同理:按收集器名模糊匹配)
for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
  gc.getCollectionCount(); gc.getCollectionTime();
}

// 线程与死锁
ThreadMXBean threads = ManagementFactory.getThreadMXBean();
threads.getThreadCount();
long[] deadlocked = threads.findDeadlockedThreads();  // null = 无死锁
```

**学习要点**:这些 MXBean 是 JVM 内置的"管理接口",VisualVM/JConsole 展示的也是同一数据源 —— 你相当于手写了一个嵌入式 JConsole。

## 二、Micrometer 自定义指标(Agent 调用统计)

在 AgentOrchestrator.dispatch 里埋点:

```java
Counter.builder("agent.calls").tag("agent", intent).register(meterRegistry).increment();
Timer.builder("agent.latency").tag("agent", intent).register(meterRegistry)
     .record(durationMs, TimeUnit.MILLISECONDS);
```

成功率:成功/失败各打一个 Counter,查询时算比率。标签(tag)设计是核心 —— 按 agent 维度聚合,不要把 sessionId 做成 tag(高基数会撑爆指标系统,面试考点)。

## 三、REST 端点

`GET /api/monitor/jvm`、`/api/monitor/system`、`/api/monitor/agents` —— 结构对齐 docs/architecture.md §2。系统指标(CPU/内存)可引入 OSHI(`com.github.oshi:oshi-core`)或直接用 Actuator 的 `system.cpu.usage`。

## 四、Actuator 安全边界

`application.yml` 已配置 `include: health,info,metrics`。**禁止暴露** `env`、`heapdump`、`threaddump` 到公网 —— 会泄露环境变量(含密钥)。`show-details: when-authorized` 保证健康详情要登录。

## 五、验收清单

- [ ] `/api/monitor/jvm` 返回堆分区数据,与 `jconsole` 看到的数值一致
- [ ] 触发一次 Full GC(`System.gc()` 测试端点或压测),GC 计数增加
- [ ] 写一段双线程互相持锁的测试代码,死锁检测字段变为 true
- [ ] 发起 3 次 Agent 调用,`/api/monitor/agents` 统计正确
- [ ] 未登录访问 `/actuator/health` 只见 status,不见 details
