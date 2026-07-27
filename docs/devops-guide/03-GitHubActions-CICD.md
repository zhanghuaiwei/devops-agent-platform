<!-- AI 生成:DevOps 教程 03 —— GitHub Actions CI/CD -->
# 03 GitHub Actions CI/CD

> 对应里程碑:W5。CI 已就绪:`.github/workflows/ci.yml`(代码规范 + 安全扫描 + 测试 + 构建);本教程带你加 CD(部署)并打通 F1.7 的数据源。

## 一、CI 流水线导读(ci.yml 已配好)

```text
push / PR
 ├── secret-scan   gitleaks 密钥扫描(全历史)
 ├── web           npm ci → lint → vitest → build
 ├── server        setup-java 21 → spotless:check → test(骨架期放行)
 ├── agent-engine  ruff → pytest(骨架期放行)
 └── devops        docker compose config -q(配置语法校验)
```

"骨架期放行"用 `continue-on-error` + warning 实现 —— 三端就绪后逐个摘掉,这是 CI 的渐进式收紧策略。

## 二、加 CD:构建镜像并推送(学习者实现)

新建 `.github/workflows/cd.yml`,触发条件 `push: branches: [main]`:

```yaml
# 关键步骤(学习者补全为完整 workflow):
# 1. docker/login-action@v3 —— 登录镜像仓库(GHCR 或阿里云 ACR),凭据用 secrets
# 2. docker/build-push-action@v6 ×3 —— 分别构建 server/agent-engine/web 镜像
#    tag 策略:git commit sha 短哈希(可回溯)+ latest
# 3. 部署(二选一):
#    a. SSH 到服务器 docker compose pull && up -d(简单,适合个人服务器)
#    b. 仅推送镜像,部署手动(学习期推荐:先把部署做熟再自动化)
```

secrets 配置:GitHub 仓库 Settings → Secrets and variables → Actions,加 `DOCKER_REGISTRY_TOKEN`、`DEPLOY_HOST`、`DEPLOY_SSH_KEY`。

## 三、F1.7 的数据源打通

Pipeline 页面展示的"最近构建/失败率"就是调 GitHub Actions API:

```text
GET /repos/{owner}/{repo}/actions/runs                  → 构建列表
GET /repos/{owner}/{repo}/actions/runs/{id}/jobs        → Steps 耗时
POST /repos/{owner}/{repo}/actions/runs/{id}/rerun      → 重新运行
```

server 端经 GitHubApiClient(starter 模块)调用,token 用 `GITHUB_TOKEN` 环境变量。**元体验**:你的平台监控的 CI,就是它自己的 CI —— 部署一次,Pipeline 页就能看到自己的构建。

## 四、Workflow 语法速查(本仓库用到的)

| 语法 | 作用 | 实例 |
|------|------|------|
| `on` | 触发条件 | push 分支、pull_request |
| `jobs.<id>.needs` | Job 依赖 | deploy needs [web, server, agent-engine] |
| `services` | Job 内起服务容器 | server 测试时起 postgres/redis |
| `secrets.*` | 加密变量 | 绝不明文写 token |
| `cache` | 依赖缓存 | setup-node/setup-java 的 cache 参数 |

## 五、验收清单

- [ ] PR 触发 CI,5 个 job 状态正确
- [ ] 故意提交一个含 `AKIA...` 的假密钥,secret-scan 拦截
- [ ] cd.yml 跑通:镜像推到仓库,服务器上 `docker compose up -d` 更新成功
- [ ] Pipeline 页(F1.7)看到自己仓库的真实构建数据
