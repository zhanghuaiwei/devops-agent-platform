// AI 生成:WebSocket 处理器骨架 —— F1.2 对话双向通道(ADR-3)
// 学习指引见 docs/server-guide/04-WebSocket与Agent编排.md
package com.devopsagent.chat;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * 聊天 WebSocket 处理器(/ws/chat)。
 *
 * <p>学习者实现要点:
 *
 * <ol>
 *   <li>握手拦截器:从 query param 取 JWT 校验,拒绝非法连接(WebSocket 没有 Header 鉴权惯例)
 *   <li>afterConnectionEstablished:维护 sessionId → WebSocketSession 的注册表(ConcurrentHashMap)
 *   <li>handleTextMessage:解析用户消息 → 持久化 → 交给 AgentOrchestrator
 *   <li>心跳:服务端 30s PingMessage,清理死连接
 *   <li>并发:同一 session 的 sendMessage 必须加锁同步(WebSocketSession 非线程安全)
 * </ol>
 */
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    // TODO(学习者):注册会话
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, org.springframework.web.socket.TextMessage message) {
    // TODO(学习者):消息路由 → AgentOrchestrator.classifyIntent → dispatch
    throw new UnsupportedOperationException("TODO(学习者):实现 WebSocket 消息处理");
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    // TODO(学习者):清理注册表,防内存泄漏
  }
}
