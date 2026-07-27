<!-- AI 生成:DevOps 教程 02 —— Nginx 反向代理 -->
# 02 Nginx 反向代理(含 WebSocket)

> 对应里程碑:W5。配置文件已就绪:`devops/nginx/nginx.conf`,本教程讲透每一段的"为什么"。

## 一、路由拓扑

```text
浏览器 → Nginx:80
          ├── /          → web:3000        (Next.js)
          ├── /api/**    → server:8080     (Java REST,120s 超时给 SSE 留量)
          └── /ws/**     → server:8080     (WebSocket,Upgrade 头 + 1h 超时)
```

## 二、WebSocket 代理的三个坑(配置已处理,你要理解)

1. **`proxy_set_header Upgrade $http_upgrade` + `Connection "upgrade"`**:WS 握手本质是 HTTP/1.1 的 Upgrade 请求,头不转发后端收到的是普通 HTTP → 400。这是 WS 代理失败的第一大原因
2. **`proxy_read_timeout 3600s`**:Nginx 默认 60s 无流量断连 —— 聊天场景用户思考几分钟没消息就被掐断;配合服务端心跳(30s Ping)双保险
3. **`proxy_http_version 1.1`**:Nginx 默认用 HTTP/1.0 代理,不支持 Upgrade

## 三、安全细节(配置已处理)

- `X-Real-IP` / `X-Forwarded-For`:Java 的登录限流(F1.1)按真实客户端 IP 计数,不拿 Nginx 的 IP
- 安全响应头:X-Frame-Options(防点击劫持)、X-Content-Type-Options(防 MIME 嗅探)
- 生产还需:HTTPS(certbot/证书)、`limit_req` 限流区(应用层已有 @RateLimit,Nginx 层做第一道)

## 四、验证

```bash
# 配置语法检查(容器内)
docker run --rm -v $(pwd)/devops/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:1.27-alpine nginx -t

# 全栈启动后
curl -i http://localhost/api/monitor/jvm          # 应 401(未带 token)而非 502
# WebSocket 验证(websocat)
websocat "ws://localhost/ws/chat?token=<JWT>"      # 握手 101 Switching Protocols
```

## 五、验收清单

- [ ] `nginx -t` 通过
- [ ] /api 代理生效且真实 IP 传到后端(看 Java 日志)
- [ ] WS 握手 101,5 分钟无消息不断线
