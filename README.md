# 简单靶场

这个目录提供两个最小靶场，用于测试 AI-CSRF 的扫描、AI 决策、补丁草案和落地流程。

- `simple-web-target/`：前端靶场，模拟使用 Cookie 登录态发起修改邮箱请求。
- `simple-api-target/`：后端靶场，模拟 Cookie Session 登录态和一个缺少 CSRF 防护的写接口。

