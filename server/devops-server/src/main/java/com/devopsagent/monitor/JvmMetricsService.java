// AI 生成:JVM 指标采集骨架 —— F1.6(JMX + Micrometer)
// 学习指引见 docs/server-guide/06-JMX监控与Actuator.md
package com.devopsagent.monitor;

import org.springframework.stereotype.Service;

/**
 * JVM 指标采集服务:Dashboard 的数据来源。
 *
 * <p>学习者实现要点:
 *
 * <ul>
 *   <li>堆内存:ManagementFactory.getMemoryMXBean().getHeapMemoryUsage()
 *   <li>Eden/Old/Metaspace 分区:遍历 getMemoryPoolMXBeans() 按名字归类
 *   <li>GC 统计:getGarbageCollectorMXBeans() 拿 count/time,区分 Young/Full
 *   <li>线程与死锁:ThreadMXBean.getThreadCount() / findDeadlockedThreads()
 *   <li>Agent 调用统计:自定义 MeterRegistry Counter/Timer(在 AgentOrchestrator 里埋点)
 * </ul>
 */
@Service
public class JvmMetricsService {

  /** 返回 JVM 快照:heap、gc、threads(结构对齐 docs/architecture.md §2 /api/monitor/jvm)。 */
  public Object snapshot() {
    // TODO(学习者):用 JMX 采集并组装快照对象
    throw new UnsupportedOperationException("TODO(学习者):实现 JVM 指标采集");
  }
}
