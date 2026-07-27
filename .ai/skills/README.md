<!-- AI 生成:Skill 编写规范 —— 什么时候拆、怎么引用、何时上脚本 -->
# Skill 编写规范(拆分 / 引用 / 脚本)

## 1. 基本形态

每个 skill 一个目录,入口固定为 `SKILL.md`:

```
skills/<name>/
└── SKILL.md      # frontmatter(name + description)+ 正文(触发时机 / 步骤 / 输出格式)
```

- **frontmatter 只放元数据**:`name`、`description`(写清"什么时候用",这是智能体选择 skill 的唯一依据)
- **正文写流程**:给谁用、按什么步骤做、输出什么格式、禁止什么(反例)

## 2. 什么时候拆分

`SKILL.md` 超过 ~150 行,或出现"只有部分场景才用得到的大块内容"时,拆成 `references/` 子文档:

```
skills/code-review-checklist/          # 假想复杂化后的形态
├── SKILL.md                            # 主文件:审查流程 + 输出格式 + 各清单的索引
└── references/
    ├── security-checks.md              # P0 安全细则(只在涉及安全变更时让 AI 去读)
    └── performance-patterns.md         # P3 性能细则与正反例
```

拆分原则:
- **主文件保留"流程骨架 + 索引"**,细节下沉到 references;主文件里写明"什么情况下读哪个子文件"
- 按**使用频率**拆,不按格式拆:每次都用的留在主文件,偶尔用的才下沉(避免 AI 每次都多读一遍)
- 拆分后每个子文件同样带 `AI 生成` 头部注释

## 3. 怎么引用(避免重复维护)

- **规则不复制**:skill 涉及版本红线、代码边界、安全红线时,写"对照 `.ai/rules/xxx.md`",**禁止把规则原文抄进 skill**(code-review-checklist 的 P1 即如此处理)
- **契约以权威源为准**:接口契约引用 `docs/architecture.md`,不在 skill 里另起一份(api-contract-check 的契约表是唯一例外——它本身就是"检查用快照",改契约时必须同步)
- 引用一律用仓库相对路径

## 4. 何时上脚本

满足任一条件,就把检查逻辑从"文字描述"升级为 `scripts/` 下的可执行脚本:

- 检查项**可以机械判定**(grep/AST/命令可验证)——如 boundary-check.sh 之于 boundaries.md
- 同一检查被**两处以上复用**(pre-commit + CI + AI hook)
- 文字描述执行**结果不稳定**(不同 AI 执行宽严不一)

脚本要求:

```
skills/<name>/scripts/check-xxx.sh     # 或共用 .ai/hooks/ 下的脚本
```

- 带 `AI 生成` 注释与"为什么这么查"的说明;幂等;违例时输出 `文件:行号 + 原因` 并非零退出
- skill 正文里写明脚本的调用方式与输出解读,而不是把脚本逻辑再用文字复述一遍

## 5. 新增 skill 的落地清单

1. 在 `.ai/skills/` 建目录写 `SKILL.md`(本目录,内容源)
2. 按需在各适配层加壳:Claude Code 加 `.claude/commands/<name>.md`(frontmatter + 一句"先读 .ai/skills/<name>/SKILL.md");Trae/WorkBuddy 在各自入口的"可用能力"表加一行
3. 在 `AGENTS.md` 的 Skill 索引表登记
4. 默认开启的行为型 skill(如 option-presenter)还需在 `.ai/rules/workflow.md` 挂引用
