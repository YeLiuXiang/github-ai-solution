# Spec Kit × GitHub Platform 深度集成设计方案（双模式）

> **版本**: v1.0  
> **日期**: 2026-03-10  
> **状态**: Draft  

---

## TL;DR

通过 **两条并行路径** 将 Spec Kit SDD 方法论与 GitHub Platform 深度集成：
- **路径 A — IDE CLI 模式**：在 IDE 中通过 `/speckit.*` 命令生成 spec 产物，再通过扩展同步到 GitHub Issues/Projects
- **路径 B — Custom Agent 模式**：将 Spec Kit 各阶段定制为 `.agent.md` Custom Agents，直接在 GitHub.com 通过 Coding Agent 执行 SDD 全流程，无需本地环境

两条路径产出相同的 GitHub Platform 产物（Issues、Projects、PRs），互为补充。

---

## 目录

- [架构总览](#架构总览)
- [开发团队角色定义](#开发团队角色定义)
- [路径 A：IDE CLI 模式（本地优先）](#路径-aide-cli-模式本地优先)
- [路径 B：Custom Agent 模式（云端优先）](#路径-bcustom-agent-模式云端优先)
- [路径 C：混合模式（推荐最佳实践）](#路径-c混合模式推荐的最佳实践)
- [具体实现步骤](#具体实现步骤)
- [Custom Agent Prompt 关键设计原则](#custom-agent-prompt关键设计原则)
- [映射规则](#映射规则两条路径共用)
- [验证方案](#验证)
- [决策与权衡](#决策)
- [进一步思考](#进一步思考)

---

## 架构总览

```
（架构图略）
```

---

## 开发团队角色定义

（角色定义内容略）

---

## 路径 A：IDE CLI 模式（本地优先）

（路径 A 内容略）

---

## 路径 B：Custom Agent 模式（云端优先）

（路径 B 内容略）

---

## 路径 C：混合模式（推荐的最佳实践）

（路径 C 内容略）

---

## 具体实现步骤

（实现步骤内容略）

---

## Custom Agent Prompt 关键设计原则

（设计原则内容略）

---

## 映射规则（两条路径共用）

（映射规则内容略）

---

## 验证

（验证内容略）

---

## 决策与权衡

（决策内容略）

---

## 进一步思考

（进一步思考内容略）
