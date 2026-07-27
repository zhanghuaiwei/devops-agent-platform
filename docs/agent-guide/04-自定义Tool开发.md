<!-- AI 生成:Agent 引擎教程 04 —— 自定义 Tool 开发 -->
# 04 自定义 Tool 开发(7 个 Tool)

> 前置:完成 03(Agent 循环已通)。建议顺序:log_parser → http_health_check → docker_ps → docker_logs → github_pr_diff → github_pr_comments → k8s_pod_status(可选)。

## 一、Tool 的三要素

```python
@tool
def docker_ps(service_name: str) -> str:
    """查询指定服务的 Docker 容器运行状态。   ← ① description:Agent 的选择依据
    """
    # ② 实现:同步 SDK 用 asyncio.to_thread 包装
    # ③ 返回:str(LLM 可读文本),不是 dict
```

1. **description 是"使用说明书"**:写清"什么时候用我、输入是什么、返回什么"。模糊的 description = Agent 乱选工具
2. **返回 str 不是 dict**:Tool 返回值会作为 Observation 拼进 Prompt,JSON 文本即可,但别返回 Python 对象(会被 str() 成难看的 repr)
3. **错误处理**:Tool 抛异常会被 AgentExecutor 捕获为 Observation("工具报错:xxx"),Agent 可能重试 —— 所以错误信息要写"对 LLM 有用"的提示,如"容器不存在,请确认名称拼写"

## 二、逐个实现要点

### log_parser(纯函数,最好的起点)

正则提取 `(ERROR|WARN).*`,按异常类名聚合计数。返回:

```text
共 127 行日志,ERROR 23 行,聚合如下:
- NullPointerException × 15(首次 10:23,最近 10:45)
- ConnectTimeoutException × 8
```

**为什么先聚合再给 LLM**:127 行原始日志 ≈ 3K tokens,聚合后 ≈ 100 tokens,省钱且 LLM 更准。这是"Tool 帮 LLM 做预处理"的范式。

### http_health_check

`httpx.AsyncClient(timeout=5)`。**SSRF 边界**:校验 URL 必须是内网地址(localhost/10.x/172.16.x/192.168.x),否则你的 Agent 会变成别人的扫描器 —— 安全红线,security-reviewer 会查。

### docker_ps / docker_logs

- `docker.from_env()` 同步客户端 → `await asyncio.to_thread(...)`
- docker_logs:按 `since` 过滤 + 行数截断(如最后 500 行)+ 相同错误折叠
- **安全**:docker socket = root 权限;本服务永不暴露公网,异常信息不外泄容器内敏感值

### github_pr_diff

- `Accept: application/vnd.github.v3.diff` 拿纯文本 diff
- 截断策略:单文件 diff 保留前 200 行;总长度 ≤ 8000 字符(防爆 context window)
- token 从 settings 注入;**日志里绝不打印 token 与完整 diff**(diff 可能含别人代码里的密钥)

### k8s_pod_status(可选)

项目一可跳过;项目三 K8s 阶段回来补。

## 三、测试(test-writer 规约)

| Tool | 必测用例 |
|------|----------|
| log_parser | 空日志 / 无 ERROR / 多种异常聚合 / 超长日志截断 |
| http_health_check | 200 / 500 / 超时 / 非公网 URL 被 SSRF 校验拦截 |
| docker_ps | 容器存在 / 不存在(错误信息对 LLM 友好) |
| github_pr_diff | 正常 diff / PR 不存在 / 超长截断 |

外部依赖(docker/github)用 `pytest-mock` 或 respx mock,不要在 CI 里连真实服务。

## 四、验收清单

- [ ] 每个 Tool 的 docstring 都能回答"何时用/输入/返回"
- [ ] 在 `/docs` 之外的 Python REPL 里单独调用每个 Tool 验证(不依赖 Agent)
- [ ] Tool 报错时 Agent 能收到可读错误并给出合理解释
