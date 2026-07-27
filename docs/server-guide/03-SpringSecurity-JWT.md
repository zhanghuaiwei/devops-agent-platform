<!-- AI 生成:服务端搭建教程 03 —— Spring Security 6.3 + JWT + RBAC + 限流 -->
# 03 Spring Security 6.3 认证链(F1.1)

> 前置:完成 02。对应功能点:F1.1 全部。这是服务端最硬的一课,建议分两天完成。

## 学习目标

- 手写完整 JWT 无状态认证:注册 / 登录 / 刷新
- 理解 SecurityFilterChain 的过滤器顺序
- 用 @PreAuthorize 实现三角色 RBAC
- 用自定义注解 + AOP + Redis 实现登录限流

## 一、JWT 三段式结构(先建立心智模型)

```
xxxxx.yyyyy.zzzzz
Header(算法).Payload(claims: sub/role/exp).Signature(HMAC-SHA256 签名)
```

关键认知:**JWT 是无状态的自证凭证** —— 服务端不存会话,验签即认证。这带来两个问题,正是本功能的两个设计点:
1. Token 无法主动失效 → 用 Redis 黑名单解决(登出/刷新后旧 token 进黑名单)
2. 过期时间太短体验差、太长不安全 → 双 Token 策略(accessToken 2h + refreshToken 7d)

## 二、实施步骤

### 1. User 实体与 Mapper(MyBatis-Plus)

表结构(DDL,在 `devops/init.sql` 中维护):

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(72)  NOT NULL,   -- BCrypt 输出固定 60 字符,留余量
  role          VARCHAR(16)  NOT NULL DEFAULT 'VIEWER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

实体继承 MyBatis-Plus 的用法:`@TableName("users")` + `BaseMapper<User>`。

### 2. JwtService(签发与校验)

用 jjwt 0.12.x(注意 API 与旧版 0.9 差异很大):

```java
// 签发(示意,学习者补全为 Component):
String token = Jwts.builder()
    .subject(email)
    .claim("role", role)
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + accessTtlSeconds * 1000))
    .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
    .compact();
```

安全要求:secret 至少 256 bit,只走环境变量 `JWT_SECRET`。

### 3. JwtAuthenticationFilter(骨架在 auth/ 包)

四步:取 token → 验签 → 查 Redis 黑名单 → 填 SecurityContext。
常见坑:**过滤器抛异常不会被 @RestControllerAdvice 捕获**,要在 filter 内自行写 401 响应。

### 4. SecurityFilterChain(替换 02 的临时配置)

```java
http.csrf(AbstractHttpConfigurer::disable)      // 无状态 API 不需要 CSRF
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers("/api/auth/**", "/actuator/health", "/ws/**").permitAll()
        .anyRequest().authenticated())
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
```

### 5. RBAC

三种角色(枚举):`ADMIN` > `DEVELOPER` > `VIEWER`。在敏感方法上加:

```java
@PreAuthorize("hasRole('ADMIN')")               // 用户管理
@PreAuthorize("hasAnyRole('ADMIN','DEVELOPER')") // 触发构建重跑
```

进阶(可选):用 `RoleHierarchy` 让 ADMIN 自动拥有下级权限。

### 6. 登录限流(@RateLimit + AOP + Redis)

切面伪代码:

```java
@Around("@annotation(rateLimit)")
public Object around(ProceedingJoinPoint pjp, RateLimit rateLimit) {
  String key = "rate:" + rateLimit.key() + ":" + clientIp();
  Long count = redis.opsForValue().increment(key);
  if (count == 1) redis.expire(key, rateLimit.windowSeconds(), SECONDS);
  if (count > rateLimit.limit()) throw new RateLimitExceededException(); // → 429
  return pjp.proceed();
}
```

## 三、验收清单

- [ ] 注册 → 登录 → 携带 accessToken 访问受保护端点 → 200
- [ ] 错误密码 → 401(响应不区分"用户不存在"与"密码错",防枚举)
- [ ] accessToken 过期 → 401;用 refreshToken 换新 accessToken → 200
- [ ] VIEWER 调 ADMIN 端点 → 403
- [ ] 同一 IP 连续 11 次登录 → 第 11 次返回 429

## 四、测试要求(test-writer 规约)

至少覆盖:密码错误 / token 过期 / token 篡改 / 黑名单 token / 限流边界(第 10、11 次)。
