<!-- AI 生成:规则片段 —— 安全红线。唯一内容源,入口文件只引用不复制 -->
# 安全红线

1. 禁止硬编码密钥、Token、连接串(CI 会用 gitleaks 扫描,提交时 `.ai/hooks/boundary-check.sh` 粗筛)
2. SQL 只允许走 MyBatis-Plus 参数绑定,禁止字符串拼接
3. Web 端渲染 Markdown 必须经过 sanitize(防 XSS)
4. 新增依赖必须说明理由,禁止引入 2 年未维护的包

> 深度安全审查(注入 / 越权 / 依赖 CVE / 限流)见 `.ai/agents/security-reviewer.md`。
