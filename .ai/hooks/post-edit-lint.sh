#!/usr/bin/env bash
# AI 生成:AI 智能体 PostToolUse hook —— AI 编辑文件后按文件类型自动 lint
# 用途:AI 每次写代码后立即得到规范反馈,避免"写完一堆再返工"
# 启用方式见同目录 README.md
set -uo pipefail

FILE="${1:-}"                                   # hook 传入的被编辑文件路径
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx)
    # Web 文件:eslint 单文件检查(在 web/ 下执行以命中其配置)
    (cd "$(dirname "$0")/../../web" && pnpm exec eslint "$FILE" --max-warnings=0)
    ;;
  *.py)
    # Python 文件:ruff 单文件检查
    ruff check "$FILE" && ruff format --check "$FILE"
    ;;
  *.java)
    # Java 文件:spotless 全量(单文件需 google-java-format jar,此处用 Maven 插件)
    (cd "$(dirname "$0")/../../server" && ./mvnw -q spotless:check) || true
    ;;
esac
