<!-- AI 生成:安全策略 -->
# Security Policy

## 支持范围

本仓库为学习型项目;若你发现安全问题(包括但不限于:硬编码密钥泄露、注入漏洞、越权访问、依赖 CVE),请按以下方式报告。

## 报告渠道

- 直接在仓库开 Issue(标题前缀 `[security]`),或私下联系维护者
- 请勿在公开渠道披露未修复的漏洞细节

## 本仓库的安全红线(见 CLAUDE.md §4)

1. 禁止硬编码密钥/Token/连接串(由 gitleaks 在 pre-commit 与 CI 双重拦截)
2. SQL 只允许参数绑定(MyBatis-Plus),禁止字符串拼接
3. Markdown/HTML 渲染必须 sanitize(防 XSS)
4. 新增依赖须评估维护活跃度与许可证

## 密钥泄露应急处置

1. 立即吊销/轮换泄露的密钥(视为已泄露,不论是否被利用)
2. 从 Git 历史中清除(`git filter-repo` 或 BFG)
3. 在 gitleaks baseline 之外不留白名单
