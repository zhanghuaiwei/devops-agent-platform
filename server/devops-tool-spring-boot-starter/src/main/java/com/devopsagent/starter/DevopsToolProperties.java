// AI 生成:Starter 配置属性类 —— 骨架已完成(F1.8)
// 学习者注意:spring-boot-configuration-processor 会据此生成 IDE 自动补全元数据
package com.devopsagent.starter;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * DevOps 工具配置属性,前缀 devops.tools。
 *
 * <p>application.yml 示例:
 *
 * <pre>
 * devops:
 *   tools:
 *     github:
 *       enabled: true
 *       token: ${GITHUB_TOKEN:}
 * </pre>
 */
@ConfigurationProperties(prefix = "devops.tools")
public class DevopsToolProperties {

  private final GitHub github = new GitHub();
  private final Docker docker = new Docker();
  private final K8s k8s = new K8s();

  public GitHub getGithub() {
    return github;
  }

  public Docker getDocker() {
    return docker;
  }

  public K8s getK8s() {
    return k8s;
  }

  /** GitHub REST API 配置。 */
  public static class GitHub {
    /** 是否启用 GitHubApiClient 自动装配。 */
    private boolean enabled = false;
    /** 个人访问令牌(只走环境变量,安全红线)。 */
    private String token;
    /** 目标仓库 owner/repo,如 zhanghuaiwei/devops-agent-platform。 */
    private String repository;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getToken() {
      return token;
    }

    public void setToken(String token) {
      this.token = token;
    }

    public String getRepository() {
      return repository;
    }

    public void setRepository(String repository) {
      this.repository = repository;
    }
  }

  /** Docker API 配置。 */
  public static class Docker {
    private boolean enabled = false;
    /** Docker daemon 地址,如 unix:///var/run/docker.sock 或 tcp://localhost:2375。 */
    private String host = "unix:///var/run/docker.sock";

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getHost() {
      return host;
    }

    public void setHost(String host) {
      this.host = host;
    }
  }

  /** K8s API 配置。 */
  public static class K8s {
    private boolean enabled = false;
    /** kubeconfig 路径,默认 ~/.kube/config。 */
    private String kubeconfig = System.getProperty("user.home") + "/.kube/config";

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getKubeconfig() {
      return kubeconfig;
    }

    public void setKubeconfig(String kubeconfig) {
      this.kubeconfig = kubeconfig;
    }
  }
}
