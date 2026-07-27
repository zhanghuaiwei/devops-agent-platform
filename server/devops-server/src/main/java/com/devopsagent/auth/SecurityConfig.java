// AI 生成:Spring Security 6.3 配置骨架 —— F1.1 JWT + RBAC
// 学习指引见 docs/server-guide/03-SpringSecurity-JWT.md
package com.devopsagent.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 安全配置:无状态 JWT 认证 + 方法级 RBAC。
 *
 * <p>设计要点(学习者实现时需理解):
 *
 * <ul>
 *   <li>STATELESS:JWT 场景禁用 Session,每次请求靠 Token 自证
 *   <li>/api/auth/** 放行;其余请求必须认证
 *   <li>@EnableMethodSecurity 开启 @PreAuthorize("hasRole('ADMIN')") 方法级鉴权
 *   <li>JwtAuthenticationFilter 必须注册在 UsernamePasswordAuthenticationFilter 之前
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // 开启方法级鉴权(RBAC 三角色:ADMIN/DEVELOPER/VIEWER)
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // TODO(学习者):按 docs/server-guide/03 完成过滤器链配置
    // 提示:http.csrf(disable).sessionManagement(STATELESS).authorizeHttpRequests(...)
    //      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
    throw new UnsupportedOperationException("TODO(学习者):实现 SecurityFilterChain");
  }

  /**
   * 密码加密器:BCrypt 自带随机盐,相同密码每次哈希不同(抗彩虹表)。
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
