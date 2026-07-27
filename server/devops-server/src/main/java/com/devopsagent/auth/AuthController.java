// AI 生成:认证端点骨架 —— F1.1 注册/登录/刷新(登录限流 10次/5min/IP)
// 学习指引见 docs/server-guide/03-SpringSecurity-JWT.md
package com.devopsagent.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证 REST 端点。契约见 docs/architecture.md §2。
 *
 * <p>注意:登录端点必须挂 @RateLimit(10次/5分钟/IP),超限返回 429(common 包已实现注解)。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

  /** 注册:邮箱+密码,BCrypt 加密入库,直接签发双 Token。 */
  @PostMapping("/register")
  public Object register() {
    // TODO(学习者):参数校验(@Valid + 邮箱格式 + 密码强度)→ 查重 → 入库 → 签发 Token
    throw new UnsupportedOperationException("TODO(学习者):实现注册");
  }

  /** 登录:校验密码,签发 accessToken(2h) + refreshToken(7d,Redis 缓存)。 */
  @PostMapping("/login")
  public Object login() {
    // TODO(学习者):@RateLimit + 密码校验 + 双 Token 签发 + refreshToken 写 Redis
    throw new UnsupportedOperationException("TODO(学习者):实现登录");
  }

  /** 无感刷新:refreshToken 换 accessToken;注意并发刷新竞态(用 Redis 锁或旋转令牌)。 */
  @PostMapping("/refresh")
  public Object refresh() {
    // TODO(学习者):校验 refreshToken(Redis 比对)→ 签发新 accessToken
    throw new UnsupportedOperationException("TODO(学习者):实现 Token 刷新");
  }
}
