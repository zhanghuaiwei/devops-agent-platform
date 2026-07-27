<!-- AI 生成:服务端搭建教程 05 —— MyBatis-Plus 与数据库设计 -->
# 05 MyBatis-Plus 与数据库(F1.2/F1.3 持久化)

> 前置:完成 02(可与 03/04 并行)。对应功能点:会话/消息/审查报告的持久化。

## 学习目标

- 设计本项目全部表结构(4 张表)
- 掌握 MyBatis-Plus 3.5.7:BaseMapper、Wrapper 条件构造、分页插件、逻辑删除
- 理解 JSONB 的使用场景(推理步骤存储)

## 一、表结构设计(写入 devops/init.sql,容器启动自动执行)

架构文档(docs/architecture.md §5)已有概要,这里补全细节决策:

| 表 | 关键设计决策 | 为什么 |
|---|---|---|
| `users` | email 唯一索引 | 登录查询快 + 防重复注册 |
| `chat_sessions` | `(user_id, archived, created_at)` 复合索引 | 会话列表就是这个过滤+排序 |
| `chat_messages` | `events_json JSONB` | 推理步骤是半结构化数据,JSONB 可索引可查询,比 TEXT 强 |
| `review_reports` | `issues_json JSONB` + `verdict` 冗余列 | 列表页只看 verdict,不必解析 JSON |

原则:**列表查询高频字段独立成列,详情低频字段塞 JSONB**。这是关系库 vs 文档库的折中实践。

## 二、MyBatis-Plus 实施

### 1. 分页插件(F1.2 会话分页必配)

```java
@Configuration
public class MybatisPlusConfig {
  @Bean
  public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.POSTGRE_SQL));
    return interceptor;
  }
}
```

不配它,`Page<T>` 不会自动分页 —— 最常见的"为什么我的分页没生效"。

### 2. 条件构造器(会话列表查询示例)

```java
LambdaQueryWrapper<ChatSession> wrapper = Wrappers.lambdaQuery(ChatSession.class)
    .eq(ChatSession::getUserId, userId)
    .eq(ChatSession::getArchived, archived)
    .orderByDesc(ChatSession::getCreatedAt);
Page<ChatSession> page = sessionMapper.selectPage(new Page<>(pageNum, 10), wrapper);
```

### 3. 逻辑删除(会话删除用)

`@TableLogic` 标注 `deleted` 字段:删除变 UPDATE,查询自动带 `deleted=0`。思考:为什么消息表不用逻辑删除?(消息随会话级联,真删)

### 4. JSONB 字段映射

自定义 `TypeHandler` 或用 `JacksonTypeHandler`(`@TableField(typeHandler = JacksonTypeHandler.class)` + `@TableName(autoResultMap = true)`)。

## 三、安全红线自查

- 任何 SQL 不允许字符串拼接(MyBatis-Plus Wrapper 天然参数绑定)
- `#{}` 占位,禁用 `${}`(除非确认是白名单枚举值,如排序字段)

## 四、验收清单

- [ ] 4 张表由 init.sql 创建成功(`docker compose down -v && up -d` 验证可重放)
- [ ] 会话分页接口:第 2 页数据正确,total 正确
- [ ] 归档切换不影响未归档列表查询
- [ ] JSONB 字段能整体写入并按 key 查询(`events_json -> 'steps'`)
