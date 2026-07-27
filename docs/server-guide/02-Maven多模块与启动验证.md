<!-- AI 生成:服务端搭建教程 02 —— Maven 多模块与启动验证 -->
# 02 Maven 多模块与启动验证

> 前置:完成 01。对应功能点:F1.8 的前置工程化基础。

## 学习目标

- 理解父 POM 的 `dependencyManagement` 如何统一版本
- 理解主应用与 starter 模块的依赖方向
- 让 `devops-server` 启动到"能访问 /actuator/health"

## 模块关系

```
server/pom.xml (父,packaging=pom)
├── devops-server                      主应用,依赖 ↓
└── devops-tool-spring-boot-starter    自定义 Starter(不依赖主应用,可独立发布)
```

关键设计:**starter 不依赖主应用**。Starter 是"能力提供方",主应用是"能力消费方",方向反了就是循环依赖,面试必问。

## 实施步骤

### 1. 先装 starter 到本地仓库

```bash
cd server
./mvnw install -pl devops-tool-spring-boot-starter
```

为什么:主应用以普通 jar 坐标引入 starter,多模块开发期 Maven Reactor 会自动解析,但单独构建主应用时需要本地仓库里有。

### 2. 临时注释掉 TODO 实现,先跑通启动

骨架中 `SecurityConfig.securityFilterChain` 等方法抛 `UnsupportedOperationException`。启动应用前,先把它改成一个最小可用配置:

```java
// 临时最小配置(03 教程会替换为完整 JWT 链):
http.csrf(c -> c.disable())
    .authorizeHttpRequests(a -> a.anyRequest().permitAll());
return http.build();
```

> 这是学习节奏设计:**先让骨架跑起来,再一块块填肉**。每次只改一个关注点。

### 3. 启动并验证

```bash
./mvnw spring-boot:run -pl devops-server
curl http://localhost:8080/actuator/health
# 期望:{"status":"UP"}(此时 devopsTool 健康节点显示 unknown,属预期)
```

## 知识卡片:@SpringBootApplication 启动时发生了什么

1. `@ComponentScan` 扫描 `com.devopsagent` 包下的 `@Component/@Service/@RestController`
2. `@EnableAutoConfiguration` 读取所有 jar 中
   `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
   —— 你的 starter 就是这样被发现的(F1.8 的核心机制,07 教程深入)

## 验收清单

- [ ] starter `install` 成功
- [ ] 主应用启动无异常
- [ ] `/actuator/health` 返回 UP

## 常见坑

| 问题 | 原因 |
|------|------|
| 启动报数据库连接失败 | devops/docker-compose 的 postgres 没起 |
| starter 的自动配置没生效 | imports 文件路径写错,或没执行 install |
