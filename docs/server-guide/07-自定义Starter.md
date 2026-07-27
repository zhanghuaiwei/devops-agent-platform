<!-- AI 生成:服务端搭建教程 07 —— 自定义 Spring Boot Starter(F1.8) -->
# 07 自定义 Spring Boot Starter(F1.8)

> 前置:完成 02。对应功能点:F1.8 全部。这是面试"Spring Boot 自动配置原理"的实战答案。

## 学习目标

- 走完自动配置装配链:imports 声明 → @AutoConfiguration → @ConditionalOnProperty → @ConfigurationProperties
- 实现 GitHubApiClient(RestClient)与 DevopsToolHealthIndicator
- 生成 IDE 配置自动补全元数据

## 一、装配链全景(背下来,面试直接画)

```
应用启动
  → @EnableAutoConfiguration
  → 扫描所有 jar 的 META-INF/spring/...AutoConfiguration.imports   ← 你的 starter 在这里被注册
  → 加载 DevopsToolAutoConfiguration
  → @EnableConfigurationProperties 绑定 devops.tools.* → DevopsToolProperties
  → 每个 @Bean 上的 @ConditionalOnProperty 逐个求值
      devops.tools.github.enabled=true  → 装配 GitHubApiClient
      devops.tools.docker.enabled=false → 跳过
  → Bean 进入容器,主应用 @Autowired 可用
```

Spring Boot 2.x 用 `META-INF/spring.factories`,3.x 迁移到 `AutoConfiguration.imports` —— 区别在于新文件每行一个全限定类名,支持索引加速启动。

## 二、实施步骤

### 1. 三个 @Bean(填 DevopsToolAutoConfiguration 的 TODO)

```java
@Bean
@ConditionalOnProperty(prefix = "devops.tools.github", name = "enabled", havingValue = "true")
GitHubApiClient gitHubApiClient(DevopsToolProperties props) {
  // fail-fast:enabled=true 但 token 为空 → 抛异常带明确提示,不要等运行时才爆
  Assert.hasText(props.getGithub().getToken(),
      "devops.tools.github.enabled=true 时必须配置 devops.tools.github.token");
  return new GitHubApiClient(props.getGithub().getToken(), props.getGithub().getRepository());
}
```

docker/k8s 同理(客户端依赖学习时按需引入 docker-java / fabric8 kubernetes-client)。

### 2. GitHubApiClient 实现要点

- `RestClient.builder().baseUrl("https://api.github.com").defaultHeader("Authorization", "Bearer " + token).build()`
- PR diff:`Accept: application/vnd.github.v3.diff`,返回的是纯文本 diff 不是 JSON
- 分页:`per_page=100`,解析响应头 `Link: <...>; rel="next"`
- 限流:读 `X-RateLimit-Remaining`,接近 0 时打印警告日志(**不打 token!**)

### 3. HealthIndicator

对 GitHub 调 `GET /rate_limit`(不计费端点)做连通性探测,超时 2s。注册为 `@Bean DevopsToolHealthIndicator devopsToolHealthIndicator(...)`,Actuator 自动聚合成 `"devopsTool": {"status": "UP"}`。

### 4. IDE 自动补全验证

`./mvnw install` 后,在主应用 `application.yml` 输入 `devops.tools.` 应出现 github/docker/k8s 的补全提示 —— 这是 `spring-boot-configuration-processor` 编译期生成的 `spring-configuration-metadata.json` 的功劳。

### 5. 条件装配验证(实验学习法)

```yaml
devops:
  tools:
    github:
      enabled: false
```

启动日志加 `--debug`,看 `CONDITIONS EVALUATION REPORT`:GitHubApiClient 应出现在 Negative matches。改回 true 出现在 Positive matches。**这份报告就是自动配置原理的实证**。

## 三、验收清单

- [ ] enabled=false 时容器无对应 Bean(注入会报 NoSuchBeanDefinitionException)
- [ ] enabled=true 但 token 缺失 → 启动失败且提示明确
- [ ] `/actuator/health` 出现 devopsTool 节点
- [ ] yml 中有 IDE 自动补全
- [ ] `./mvnw deploy`(可选)能发布到私有仓库

## 四、面试问答预演

Q:什么逻辑值得封装为 Starter?
A:三个特征:可复用(多项目要用)、有外部依赖(配置驱动)、有开关需求(条件装配)。本项目的 GitHub/Docker/K8s 客户端三者全中。
