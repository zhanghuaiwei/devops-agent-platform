// AI 生成:Agent 编排器骨架 —— F1.2 意图分类 → 任务规划 → 调度到 agent-engine
// 学习指引见 docs/server-guide/04-WebSocket与Agent编排.md
package com.devopsagent.agent;

import org.springframework.stereotype.Component;

/**
 * Agent 编排层:server 侧的智能路由。
 *
 * <p>职责边界(CLAUDE.md 边界规则):
 *
 * <ul>
 *   <li>做意图分类(code_review / deploy / diagnose / general)与任务规划
 *   <li>只做编排,不做推理:推理调用 agent-engine 的 4 个契约端点(ADR-2)
 *   <li>把 agent-engine 的 SSE 事件流转发给 WebSocket 会话(协议见 docs/architecture.md §3)
 * </ul>
 */
@Component
public class AgentOrchestrator {

  /**
   * 意图分类:先用关键词规则快速命中(零成本),命中不了再调 LLM 语义分类。
   *
   * @param userMessage 用户原始输入
   * @return 意图标识:code_review | deploy | diagnose | general
   */
  public String classifyIntent(String userMessage) {
    // TODO(学习者):实现两级分类(关键词 → LLM);思考:为什么不能只用关键词?
    throw new UnsupportedOperationException("TODO(学习者):实现意图分类");
  }

  /**
   * 调度执行:按意图选择 agent-engine 端点,桥接 SSE → WebSocket。
   *
   * <p>注意:agent-engine 推理耗时可达分钟级,必须异步(虚拟线程),禁止阻塞 WebSocket 线程。
   */
  public void dispatch(String intent, String sessionId, String userMessage) {
    // TODO(学习者):实现调度 + SSE→WS 桥接 + 错误兜底(引擎不可达时友好提示)
    throw new UnsupportedOperationException("TODO(学习者):实现 Agent 调度");
  }
}
