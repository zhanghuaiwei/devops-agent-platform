<!-- AI 生成:规则片段 —— 代码边界与所有权地图。唯一内容源,入口文件只引用不复制 -->
# 代码边界(必须遵守)

| 边界 | 规则 |
|------|------|
| Web → Server | 只允许通过 `/api/**` REST + WebSocket 调用;禁止在组件里直接写 SQL/HTTP 客户端逻辑 |
| Server → Agent Engine | 只允许走 `agent-engine` 暴露的 4 个 HTTP 端点(`/api/agent/chat\|code-review\|deploy\|diagnose`);禁止 Server 直接 import Python 逻辑或直连 Agent 的数据源 |
| 包结构 | Server 代码必须落在 `com.devopsagent.{auth,chat,agent,pipeline,monitor,common}` 之一;跨包依赖只许上层调下层(auth/chat/agent/pipeline/monitor → common) |
| mock 边界 | Web 端所有 mock 数据只允许出现在 `web/src/mocks/`;业务组件禁止内联 mock 常量 |
| 配置 | 任何密钥/令牌只许走环境变量;代码、注释、文档中禁止出现真实密钥 |

## 代码所有权地图

```
web/src/mocks/**        → 唯一允许写 mock 数据的位置
server/**/common/**     → 三端共享逻辑唯一出口,改动需双人确认
agent-engine/app/tools/ → 每个 Tool 一个文件,description 即 Agent 的"使用说明书",改它会影响 Agent 行为,需回归测试
devops/**               → 基础设施即代码,任何端口/密码改动同步更新 docs/devops-guide
```

## 自动化检查

提交时 `pre-commit` 会执行 `.ai/hooks/boundary-check.sh`(mock 边界 / 绝对 URL / docker-k8s 依赖位置 / 硬编码密钥粗筛),违例即阻断提交。
