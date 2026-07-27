-- AI 生成:数据库初始化脚本 —— PostgreSQL 容器首次启动自动执行
-- 表结构设计决策见 docs/server-guide/05-MyBatisPlus与数据库.md
-- 注意:修改本文件后需 docker compose down -v 清卷重建才会重放(init 只跑一次)

-- F1.1 用户表
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(72)  NOT NULL,            -- BCrypt 输出 60 字符,留余量
  role          VARCHAR(16)  NOT NULL DEFAULT 'VIEWER'
                CHECK (role IN ('ADMIN', 'DEVELOPER', 'VIEWER')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- F1.2 会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(id),
  title       VARCHAR(200) NOT NULL DEFAULT '新会话',
  archived    BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted     BOOLEAN      NOT NULL DEFAULT FALSE,   -- 逻辑删除(MyBatis-Plus @TableLogic)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- 会话列表查询(user_id + archived + 时间倒序)的复合索引
CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions (user_id, archived, created_at DESC);

-- F1.2 消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id          BIGSERIAL PRIMARY KEY,
  session_id  BIGINT       NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(16)  NOT NULL CHECK (role IN ('user', 'assistant')),
  agent       VARCHAR(32),                          -- code_review/deploy/diagnose/general
  content     TEXT         NOT NULL,
  events_json JSONB,                                -- 推理步骤(thought/action/observation)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages (session_id, created_at);

-- F1.3 代码审查报告表
CREATE TABLE IF NOT EXISTS review_reports (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT       NOT NULL REFERENCES users(id),
  pr_url      VARCHAR(500) NOT NULL,
  verdict     VARCHAR(20)  NOT NULL,                -- approve/request_changes/reject(冗余列:列表免解析 JSON)
  issues_json JSONB        NOT NULL,                -- 问题明细(Critical/High/Medium/Low)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON review_reports (user_id, created_at DESC);
