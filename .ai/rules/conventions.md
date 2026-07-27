<!-- AI 生成:规则片段 —— 代码规范、测试要求与常用命令。唯一内容源,入口文件只引用不复制 -->
# 代码规范摘要(详见 .pre-commit-config.yaml 与各端 ESLint/Checkstyle/ruff 配置)

- **Java**:Google Java Format;类必须有 Javadoc;禁止 `System.out.println`(用 SLF4J);禁止吞异常的空 catch
- **Python**:ruff(lint+format);全部函数必须有类型注解;禁止 `print()`(用 structlog);异步 IO 优先
- **TypeScript**:ESLint + Prettier;禁止 `any`(用 `unknown` + 类型收窄);组件必须声明 Props 接口;服务端逻辑只在 Server Component / API Route

# 测试要求

- 新功能必须带测试:Java(JUnit 5 + Mockito)、Python(pytest)、Web(Vitest + Testing Library)
- 覆盖率门槛:核心包(auth/agent)≥ 70%,其余 ≥ 50%
- 测试命名:`方法名_场景_期望结果`

# 提交规范(Conventional Commits)

```
<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore | perf | security
scope: web | server | agent | devops | docs | engineering
示例: feat(web): 新增 Pipeline 失败率趋势图
```

- 提交前必须过 `pre-commit run --all-files`
- PR 必须填写 `.github/pull_request_template.md` 的检查清单
- 细则见 `.ai/skills/commit-convention/SKILL.md`

# 常用命令

```bash
# Web(Node 版本先对齐:.nvmrc → nvm use;包管理器统一用 pnpm,禁用 npm/yarn)
nvm use && cd web && pnpm install && pnpm dev / pnpm lint / pnpm test / pnpm build
# Server(骨架实施后)
cd server && ./mvnw verify
# Agent Engine(骨架实施后)
cd agent-engine && pytest && ruff check .
# 提交前全量检查
pre-commit run --all-files
```
