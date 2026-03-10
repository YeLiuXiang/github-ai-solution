# Spec Kit × GitHub Platform 深度集成设计方案（双模式）

> **版本**: v1.0  
> **日期**: 2026-03-10  
> **状态**: Draft  

---

## TL;DR

通过 **两条并行路径** 将 Spec Kit SDD 方法论与 GitHub Platform 深度集成：
- **路径 A — IDE CLI 模式**：在 IDE 中通过 `/speckit.*` 命令生成 spec 产物，再通过扩展同步到 GitHub Issues/Projects
- **路径 B — Custom Agent 模式**：将 Spec Kit 各阶段定制为 `.agent.md` Custom Agents，直接在 GitHub.com 上通过 Coding Agent 执行 SDD 全流程，无需本地环境

两条路径产出相同的 GitHub Platform 产物（Issues、Projects、PRs），互为补充。

---

## 目录

- [架构总览](#架构总览)
- [开发团队角色定义](#开发团队角色定义)
- [路径 A：IDE CLI 模式（本地优先）](#路径-aide-cli-模式本地优先)
- [路径 B：Custom Agent 模式（云端优先）](#路径-bcustom-agent-模式云端优先)
- [路径 C：混合模式（推荐最佳实践）](#路径-c混合模式推荐的最佳实践)
- [具体实现步骤](#具体实现步骤)
- [Custom Agent Prompt 设计原则](#custom-agent-prompt-关键设计原则)
- [映射规则](#映射规则两条路径共用)
- [验证方案](#验证)
- [决策与权衡](#决策)
- [进一步思考](#进一步思考)

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                      GitHub Platform（统一产出层）                    │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Issues   │  │ Projects │  │Milestones│  │   PRs    │           │
│  │(Epic/Story│  │ (Board   │  │(Feature  │  │(Coding   │           │
│  │ /Task)    │  │  视图)   │  │ 版本)    │  │ Agent)   │           │
│  └─────▲─────┘  └────▲─────┘  └────▲─────┘  └────▲─────┘           │
│        │             │             │             │                  │
│  ──────┼─────────────┼─────────────┼─────────────┼──────────────── │
│        │             │             │             │                  │
│  ┌─────┴─────────────┴─────────────┴─────────────┴─────┐           │
│  │            GitHub Actions 自动化编排层               │           │
│  │  (specs/**/*.md 变更触发 → 同步 Issues/Projects)     │           │
│  └──────────────────────┬──────────────────────────────┘           │
│                         │                                          │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │ 路径 A   │    │  路径 B    │   │  路径 C    │
    │ IDE CLI  │    │ Custom     │   │ Hybrid     │
    │ 模式     │    │ Agent 模式 │   │ 混合模式   │
    │          │    │            │   │            │
    │ /speckit │    │ GitHub.com │   │ A 生成 spec│
    │ 命令行   │    │ Agent Tab  │   │ B 执行实现 │
    │ → spec/  │    │ → spec/ +  │   │            │
    │ 文件产物 │    │ Issues/PRs │   │            │
    └──────────┘    └────────────┘   └────────────┘
```

---

## 开发团队角色定义

在 Spec Kit × GitHub Platform 集成方案中，团队成员按以下四个核心角色参与 SDD 各阶段，每个角色对应明确的工作职责、使用的工具路径和产出物。

### 角色总览

| 角色 | 核心定位 | 主要使用路径 | 关键产出物 |
|---|---|---|---|
| 产品经理（PM） | 需求定义与验收守门人 | 路径 B（GitHub.com） | spec.md、Epic/Story Issues |
| 项目经理（PMO） | 进度管控与资源协调 | GitHub Projects + Actions | Milestone、Project Board、进度报告 |
| 架构师（Architect） | 技术决策与质量保障 | 路径 A（IDE CLI）或 路径 B | constitution.md、plan.md、data-model.md、contracts/ |
| 开发人员（Developer） | 代码实现与交付 | 路径 A（IDE CLI）+ 路径 B（Coding Agent） | 代码 PR、测试用例 |

---

### 产品经理（Product Manager）

**核心定位**：需求的源头和验收标准的最终决策者，确保开发产出符合业务目标。

| 职责领域 | 具体工作 | SDD 阶段 | 工具/操作 |
|---|---|---|---|
| 需求定义 | 撰写自然语言需求描述，输入给 `speckit-specify` Agent 生成结构化 PRD | Specify | GitHub.com Agent Tab → `speckit-specify` |
| 需求评审 | Review Agent 生成的 spec.md PR，确认用户故事和验收标准的准确性 | Specify | GitHub PR Review |
| 需求澄清 | 解答 `[NEEDS CLARIFICATION]` 标记的问题，在 Issue 评论中补充细节 | Clarify | GitHub Issues 评论 |
| 优先级排序 | 在 Project Board 上调整 Story Issues 的优先级顺序 | — | GitHub Projects v2 |
| 验收确认 | Review 实现 PR，验证是否满足 spec.md 中的验收标准 | Verify | GitHub PR Review |
| 范围管控 | 维护 spec.md 中 Out of Scope 章节，拒绝范围蔓延 | Specify | spec.md 编辑 |

**典型工作日流程**：

```
1. 在 GitHub.com Agent Tab 选择 speckit-specify → 输入新需求
2. Review Agent 生成的 spec PR → 批注修改意见 → Approve/Request Changes
3. 查看 Project Board → 调整 Story 优先级
4. 在 needs-clarification Issues 中回复澄清问题
5. Review 已完成的实现 PR → 对照验收标准验收
```

---

### 项目经理（Project Manager / PMO）

**核心定位**：SDD 流程的推动者和进度的守护者，确保各阶段按时交付。

| 职责领域 | 具体工作 | SDD 阶段 | 工具/操作 |
|---|---|---|---|
| 流程编排 | 决定何时启动下一个 SDD 阶段，推动 PR Review 和 Merge | 全流程 | GitHub PR / Agent Tab |
| 进度追踪 | 监控 Project Board 上各 Issue 的状态流转，识别阻塞项 | 全流程 | GitHub Projects v2 Board 视图 |
| Milestone 管理 | 创建/维护 Milestone，关联 Feature 版本和截止日期 | Plan | GitHub Milestones |
| 资源调度 | 将 `copilot-eligible` Task Issues 分配给 Coding Agent 或开发人员 | Tasks → Implement | Issue Assign（手动或 GraphQL API） |
| 并行度管控 | 根据 `[P]` 标记和 `parallel-ready` label 安排并行实现路径 | Tasks | Project Board + Labels 筛选 |
| 风险管理 | 监控 `needs-clarification` Issues 数量、blocked 依赖链、PR Review 滞留 | 全流程 | GitHub Notifications + Project 筛选 |
| 自动化配置 | 配置 GitHub Actions workflows（speckit-sync、speckit-dispatch） | — | `.github/workflows/` |

**典型工作日流程**：

```
1. 查看 Project Board → 确认各阶段进度 → 识别 blocked Issues
2. 推动待 Review 的 spec/plan PR → @mention 审阅者
3. tasks.md PR merge 后 → 批量 Assign Copilot 执行 copilot-eligible Tasks
4. 监控 Coding Agent PR 状态 → 推动开发人员 Review
5. 更新 Milestone 进度 → 生成周报
```

---

### 架构师（Architect）

**核心定位**：技术方案的设计者和质量标准的制定者，确保系统架构一致性和技术可行性。

| 职责领域 | 具体工作 | SDD 阶段 | 工具/操作 |
|---|---|---|---|
| 项目原则 | 制定 constitution.md，定义编码规范、测试标准、架构准则 | Constitution | IDE CLI `/speckit.constitution` 或 Agent `speckit-constitution` |
| 技术方案 | 基于 spec.md 设计技术实现方案，输出 plan.md | Plan | IDE CLI `/speckit.plan` 或 Agent `speckit-plan` |
| 数据建模 | 设计数据模型（data-model.md）、API 契约（contracts/） | Plan | IDE CLI 本地编辑 |
| 架构评审 | Review plan PR 和关键实现 PR 中的架构决策 | Plan / Verify | GitHub PR Review |
| 任务拆解指导 | 审核 tasks.md 拆解的合理性，确认依赖关系和并行度 | Tasks | Review tasks PR |
| 技术债管理 | 识别实现中的技术债务，创建 tech-debt Issues | Verify | GitHub Issues |
| Copilot 指导 | 维护 `.github/copilot-instructions.md`，确保 Coding Agent 遵循架构原则 | — | 仓库配置文件编辑 |

**典型工作日流程**：

```
1. IDE 中执行 /speckit.constitution → 迭代完善项目原则
2. 在 Agent Tab 选择 speckit-plan → 基于已 merge 的 spec 生成技术方案
3. Review plan PR → 补充架构决策记录（ADR）→ Approve
4. Review tasks PR → 确认拆解粒度和依赖合理性
5. Review 关键实现 PR → 确保符合 constitution 和 plan
```

---

### 开发人员（Developer）

**核心定位**：代码的实现者和质量的第一道防线，按照 spec 和 plan 交付高质量代码。

| 职责领域 | 具体工作 | SDD 阶段 | 工具/操作 |
|---|---|---|---|
| 任务实现 | 按 Task Issue 描述实现功能代码，遵循 constitution 中的编码规范 | Implement | IDE CLI `/speckit.implement` 或被 Assign 的 Task Issue |
| AI 辅助开发 | 利用 Coding Agent（`speckit-implement` agent）自动生成实现 PR | Implement | Issue Assign Copilot / Agent Tab |
| 测试编写 | 按 spec.md 验收标准编写单元测试和集成测试 | Implement | IDE 本地开发 |
| 代码审查 | Review 其他开发人员或 Coding Agent 生成的实现 PR | Verify | GitHub PR Review |
| 本地验证 | 在本地运行测试，确保 PR 通过 CI 检查 | Verify | IDE 终端 |
| 需求反馈 | 在实现中发现需求模糊点时，创建 `needs-clarification` Issue | Clarify | GitHub Issues |
| 文档补充 | 实现复杂逻辑时补充代码注释和 quickstart.md | Implement | IDE 本地编辑 |

**典型工作日流程**：

```
1. 查看被 Assign 的 Task Issues → 阅读 Context 中关联的 spec/plan/contracts
2. IDE 中执行 /speckit.implement → AI 辅助生成实现代码
3. 本地编写测试 → 运行通过 → Push PR
4. Review Coding Agent 自动生成的 PR → 修正/优化 → Approve
5. 在 Task Issue 中更新进度 → 关闭已完成 Issue
```

---

### 角色 × SDD 阶段职责矩阵

下表标注每个角色在各 SDD 阶段的参与方式（**R** = 负责执行, **A** = 审批, **C** = 咨询, **I** = 知会）：

| SDD 阶段 | 产品经理 | 项目经理 | 架构师 | 开发人员 |
|---|---|---|---|---|
| Constitution | C | I | **R** | I |
| Specify | **R** | I | C | I |
| Clarify | **R** | C | C | C |
| Plan | C | I | **R** | C |
| Analyze | A | I | **R** | I |
| Tasks | C | **A** | **R** | C |
| Implement | I | C | C | **R** |
| Verify | **A** | I | **A** | **R** |

> **R**esponsible = 执行者 · **A**ccountable = 审批者 · **C**onsulted = 被咨询 · **I**nformed = 被知会

---

### 角色与 Agent/工具映射

| 角色 | 常用 Custom Agent | 常用 CLI 命令 | GitHub Platform 操作 |
|---|---|---|---|
| 产品经理 | `speckit-specify` | — | PR Review, Issues 评论, Projects 排序 |
| 项目经理 | `speckit-orchestrator` | — | Milestone 管理, Issue Assign, Projects Board, Actions 配置 |
| 架构师 | `speckit-constitution`, `speckit-plan` | `/speckit.constitution`, `/speckit.plan` | PR Review, copilot-instructions.md |
| 开发人员 | `speckit-implement` | `/speckit.implement`, `/speckit.tasks` | PR 提交, Issue 更新, Code Review |

---

## 路径 A：IDE CLI 模式（本地优先）

### 执行方式

在 IDE 终端中使用 Spec Kit CLI `/speckit.*` 命令。产物为 `specs/` 目录下的 Markdown 文件。通过 **Spec Kit Extension（`spec-kit-github-platform`）** 将产物同步到 GitHub。

### 工作流

```
开发者 IDE
  │
  ├─ /speckit.constitution  → specs/constitution.md
  ├─ /speckit.specify       → specs/NNN-feature/spec.md
  ├─ /speckit.clarify       → specs/NNN-feature/spec.md (更新)
  ├─ /speckit.plan          → specs/NNN-feature/plan.md + data-model.md + contracts/
  ├─ /speckit.tasks         → specs/NNN-feature/tasks.md
  ├─ /speckit.implement     → 本地 AI agent 执行代码生成
  │
  └─ /speckit.gh-sync       → [新增命令] 将以上产物同步到 GitHub Platform
       ├─ spec.md    → Epic Issue + Story Sub-Issues
       ├─ plan.md    → Milestone + Project Board 卡片
       ├─ tasks.md   → Task Issues（label: copilot-eligible）
       └─ 可选: 批量 @copilot 指派 Task Issues
```

### 具体步骤

#### A1. 创建 Spec Kit Extension

- 参考 `extensions/template/` + `spec-kit-jira` 扩展
- `extension.yml` 注册新命令: `/speckit.gh-sync`, `/speckit.gh-issues`, `/speckit.gh-board`
- 封装 GitHub REST API（Issues/Milestones）+ GraphQL API（Projects v2）
- 认证: `GITHUB_TOKEN` / `gh auth`

#### A2. spec.md → Issues 同步

- 解析 spec.md 中的用户故事 → 每个创建 Sub-Issue
- 验收标准 → Issue Task List（`- [ ]`）
- `[NEEDS CLARIFICATION]` → Issue + label `needs-clarification`
- 创建 Epic Issue: `[Spec] Feature NNN: <name>`

#### A3. plan.md → Milestone + Project

- 创建 Milestone（技术方案摘要为 description）
- 创建/更新 Project Board 自定义字段: `SDD Phase`, `Spec Status`, `Parallel Group`

#### A4. tasks.md → Task Issues

- 批量创建 Task Issues，识别 `[P]` 并行标记和依赖关系
- label: `copilot-eligible` 标记可由 Coding Agent 执行的任务
- 可选: 通过 GraphQL API 批量将 Task Issues assign 给 `copilot-swe-agent`

#### A5. GitHub Actions 自动化

- `.github/workflows/speckit-sync.yml`
- 触发: `specs/**/*.md` push 变更 → 自动增量同步 Issues/Project
- PR merge → 自动关闭关联 Task Issues

---

## 路径 B：Custom Agent 模式（云端优先）

### 执行方式

将 Spec Kit 各 SDD 阶段封装为 **GitHub Custom Agent**（`.agent.md` 文件），放置在 `.github/agents/` 目录。用户直接在 GitHub.com Agent Tab / Copilot Chat 中选择对应 Agent 执行，无需本地安装任何工具。

### Agent 体系设计

在 `.github/agents/` 中创建以下 Custom Agent 文件：

#### B1. `speckit-constitution.agent.md` — 项目原则制定者

```yaml
---
name: speckit-constitution
description: 创建或更新项目治理原则（constitution），定义代码质量、测试标准、架构准则等核心开发原则
tools: ["read", "edit", "search"]
---
```

- Prompt 内嵌 Spec Kit constitution 模板结构
- 读取现有 codebase 上下文，生成 `specs/constitution.md`
- 同时更新 `.github/copilot-instructions.md` 确保 Coding Agent 遵循原则

#### B2. `speckit-specify.agent.md` — 需求规格生成器

```yaml
---
name: speckit-specify
description: 从自然语言需求描述生成结构化的产品需求规格（PRD），包含用户故事、验收标准、非功能需求，并自动创建 GitHub Issues
tools: ["read", "edit", "search", "github/*"]
---
```

- Prompt 内嵌 Spec Kit spec 模板（用户故事结构、验收标准格式、`[NEEDS CLARIFICATION]` 标记规则）
- 使用 `github/*` MCP 工具直接创建 Issues:
  - 创建 Epic Issue（spec 概要）
  - 创建 Story Sub-Issues（每个用户故事）
  - 创建 `needs-clarification` Issues
- 同时输出 `specs/NNN-feature/spec.md` 文件到仓库

#### B3. `speckit-plan.agent.md` — 技术方案规划师

```yaml
---
name: speckit-plan
description: 基于需求规格创建技术实现方案，包含架构决策、数据模型、API 契约，并创建 GitHub Milestone 和 Project Board
tools: ["read", "edit", "search", "github/*"]
---
```

- 读取已有 spec.md + constitution.md
- 生成 plan.md、data-model.md、contracts/
- 通过 `github/*` 创建 Milestone、更新 Project Board

#### B4. `speckit-tasks.agent.md` — 任务拆解器

```yaml
---
name: speckit-tasks
description: 将技术实现方案拆解为可执行的任务清单，批量创建 GitHub Task Issues，标记并行度和依赖关系
tools: ["read", "edit", "search", "github/*"]
---
```

- 读取 plan.md + contracts/ + data-model.md
- 生成 tasks.md
- 通过 `github/*` 批量创建 Task Issues
- 标记 `copilot-eligible`、`parallel-ready` labels
- 在 Issue body 嵌入实现上下文（关联 spec/plan 路径）

#### B5. `speckit-implement.agent.md` — 实现执行器

```yaml
---
name: speckit-implement
description: 按照任务清单逐步执行代码实现，遵循项目原则和技术方案，生成测试和实现代码
tools: ["read", "edit", "search", "execute", "github/*"]
---
```

- 读取 tasks.md + spec.md + plan.md + constitution.md
- 按任务顺序执行实现
- 遵循 constitution 中的测试优先等原则
- 通过 `github/*` 更新 Task Issue 状态

#### B6. `speckit-orchestrator.agent.md` — SDD 全流程编排器

```yaml
---
name: speckit-orchestrator
description: 编排完整的 Spec-Driven Development 流程。从需求描述出发，依次执行 specify → plan → tasks → implement 全流程
tools: ["read", "edit", "search", "execute", "github/*", "agent"]
handoffs: ["speckit-specify", "speckit-plan", "speckit-tasks", "speckit-implement"]
---
```

- 使用 `agent` 工具可以调用其他 Custom Agent（handoffs）
- 在 GitHub.com Agent Tab 中一键启动完整 SDD 流程
- 人工门控点: 每个阶段完成后创建一个 Review PR，等待人工审批后继续

### 关键触发方式

| 触发入口 | 操作 | 效果 |
|---|---|---|
| GitHub.com Agent Tab | 选 `speckit-specify` agent → 输入需求描述 | 生成 spec.md + Epic Issue + Story Issues → PR |
| GitHub Issue | Assign → Copilot → 选 `speckit-implement` agent | 直接基于 Issue 描述执行实现 → PR |
| Copilot Chat (github.com) | `/task` + 选 agent | 启动 SDD 某个阶段 |
| GitHub CLI | `gh agent-task create --agent speckit-tasks` | 命令行触发 |
| GitHub API (GraphQL) | `createIssue` + `agentAssignment.customAgent: "speckit-implement"` | 自动化脚本触发 |

---

## 路径 C：混合模式（推荐的最佳实践）

将 A 和 B 组合使用，发挥各自优势：

| SDD 阶段 | 推荐路径 | 原因 |
|---|---|---|
| Constitution | A（IDE CLI） | 项目初期，需要深度思考和本地迭代 |
| Specify | B（Custom Agent） | PM 可在 GitHub.com 上直接操作，无需 IDE |
| Clarify | B（Custom Agent） | 在 Issue 评论中直接对话澄清 |
| Plan | A 或 B | 架构师偏好本地 IDE；也可在 GitHub 上协作 |
| Analyze | B（Custom Agent） | 自动化一致性分析，结果直接发布到 Issue |
| Tasks | B（Custom Agent） | 自动创建 Task Issues 并 assign 给 Coding Agent |
| Implement | B（Custom Agent） | Coding Agent 云端执行，无需本地环境 |
| Verify | B（Custom Agent） | PR Review 自动化 |

### 混合模式工作流示例

```
1. PM 在 GitHub.com Agent Tab → 选 speckit-specify → 输入需求
   → Agent 生成 spec.md + Epic Issue + Story Sub-Issues → PR
   
2. 团队在 Issue 中讨论、人工 Review spec PR → Merge

3. 架构师在 GitHub.com Agent Tab → 选 speckit-plan
   → Agent 读取 spec.md → 生成 plan.md + Milestone → PR

4. Review plan PR → Merge

5. 在 GitHub.com Agent Tab → 选 speckit-tasks
   → Agent 读取 plan.md → 生成 tasks.md + 批量 Task Issues → PR
   → Task Issues 自动标记 copilot-eligible

6. 对每个 copilot-eligible Task Issue → Assign Copilot (+ speckit-implement agent)
   → Coding Agent 自动创建实现 PR

7. 团队 Review 每个实现 PR → Merge → Task Issue 自动关闭
```

---

## 具体实现步骤

### Phase 1: Custom Agent 定义（路径 B 核心）

1. **创建 `.github/agents/` 目录结构** — 定义 6 个 `.agent.md` 文件（B1-B6）
2. **编写 Agent Prompt** — 每个 Agent 的 Markdown body 嵌入对应的 Spec Kit 模板逻辑（spec 模板、plan 模板、tasks 模板格式和约束规则），prompt 不超过 30,000 字符
3. **配置 `github/*` MCP 工具** — 确保 Agent 可调用 GitHub MCP 的 `create_issue`, `create_pull_request` 等工具

### Phase 2: Spec Kit Extension（路径 A 核心）

4. **创建 `spec-kit-github-platform` 扩展** *(可与 Phase 1 并行)*
   - 参考 `extensions/template/` + `spec-kit-jira`
   - 注册 `/speckit.gh-sync` 命令
5. **实现 spec/plan/tasks → Issues/Projects 同步逻辑**
   - 幂等同步: Issue body 嵌入 `<!-- spec-kit:feature-001:story-3 -->` 元数据

### Phase 3: GitHub Actions 自动化桥接

6. **`.github/workflows/speckit-sync.yml`** *(依赖 Phase 2)*
   - specs/ 文件变更 → 增量同步 Issues/Project
   - PR merge → 关闭关联 Task Issues
7. **`.github/workflows/speckit-dispatch.yml`** — Coding Agent 批量调度
   - tasks.md merge 后 → 自动将 `copilot-eligible` Task Issues assign 给 Copilot
   - 使用 GraphQL API `addAssigneesToAssignable` + `agentAssignment.customAgent: "speckit-implement"`

### Phase 4: Project Board 配置

8. **GitHub Projects v2 模板** *(可与 Phase 3 并行)*
   - 自定义字段: `SDD Phase`, `Spec Status`, `Parallel Group`
   - Board 视图: Backlog → Specified → Planned → In Progress → Review → Done
   - Table 视图: 按 Feature/Milestone 分组

### Phase 5: 验证与文档

9. **端到端验证** *(依赖 Phase 1-4)*
10. **README + 使用指南**

---

## Custom Agent Prompt 关键设计原则

每个 Agent prompt 中需要嵌入的核心内容：

1. **模板结构** — 内嵌 Spec Kit 对应模板（spec/plan/tasks）的完整结构定义
2. **质量门控** — 内嵌 checklist（如 "No `[NEEDS CLARIFICATION]` markers remain"）
3. **输出规范** — 明确定义输出文件路径（`specs/NNN-feature/xxx.md`）
4. **GitHub 集成指令** — 明确指示 Agent 在生成 Markdown 文件的同时使用 `github/*` 工具创建 Issues/Milestones
5. **上下文读取** — 指示 Agent 读取 `specs/constitution.md` 和相关已有产物
6. **幂等标记** — 生成的 Issue body 嵌入 `<!-- spec-kit:... -->` 元数据

---

## 映射规则（两条路径共用）

### Spec.md → Issues

| Spec.md 章节 | GitHub 实体 | 映射逻辑 |
|---|---|---|
| Feature Title | Epic Issue Title | `[Spec] Feature NNN: <name>` |
| User Stories | Sub-Issues | 每个 "As a..." 一个 Issue |
| Acceptance Criteria | Issue Task List | `- [ ]` checklist |
| Non-functional Req | Issue + label `nfr` | 单独 Issue |
| `[NEEDS CLARIFICATION]` | Issue + label `needs-clarification` | 需人工解答 |
| Out of Scope | Epic Issue comment | 排除项 |

### Tasks.md → Issues

| Tasks.md 元素 | GitHub 实体 | 映射逻辑 |
|---|---|---|
| Task 条目 | Issue | 每条任务一个 Issue |
| `[P]` 并行标记 | Label: `parallel-ready` | 可同时执行 |
| 依赖关系 | Issue body: "Depends on #XX" | 阻塞关系 |
| Phase 分组 | Label: `phase-N` | 阶段分组 |
| 文件变更列表 | Issue body | 为 Coding Agent 提供上下文 |

### Coding Agent Issue Body 模板

为 `copilot-eligible` Task Issues 的 body 结构确保 Coding Agent 有足够上下文：

```markdown
## Task Description
{从 tasks.md 提取的任务描述}

## Context
- **Spec**: `specs/NNN-feature/spec.md`（相关用户故事和验收标准）
- **Plan**: `specs/NNN-feature/plan.md`（技术决策和架构）
- **Contracts**: `specs/NNN-feature/contracts/xxx.md`（API 定义）
- **Data Model**: `specs/NNN-feature/data-model.md`

## Dependencies
- Depends on #XX（前置任务 Issue）

## Acceptance Criteria
- [ ] {可验证的完成标准}

<!-- spec-kit:feature-NNN:task-M -->
```

---

## 相关参考资源

### Spec Kit 仓库

- `extensions/template/` — 扩展脚手架模板
- `extensions/catalog.community.json` — 社区扩展注册表
- `extensions/EXTENSION-DEVELOPMENT-GUIDE.md` — 开发指南
- `src/specify_cli/` — CLI 核心源码
- `templates/` — spec/plan/tasks 模板结构

### 参考扩展

- `spec-kit-jira` — Jira Issue 映射参考
- `spec-kit-fleet` — 生命周期编排参考
- `spec-kit-sync` — Spec 偏移检测参考

### GitHub Platform 文档

- Custom Agents 配置: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Coding Agent 创建 PR: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-a-pr
- GitHub MCP Server 工具: `github/*` (create_issue, create_pull_request 等)
- GraphQL Coding Agent Assignment API: `agentAssignment` input

---

## 验证

### 1. Custom Agent 验证（路径 B）

- 在测试仓库 `.github/agents/` 放置所有 agent.md
- GitHub.com Agent Tab → 选 `speckit-specify` → 输入需求 → 验证 spec.md + Issues 生成
- Agent Tab → 选 `speckit-plan` → 验证 plan.md + Milestone 创建
- Agent Tab → 选 `speckit-tasks` → 验证 tasks.md + Task Issues 批量创建
- Task Issue → Assign Copilot + `speckit-implement` → 验证自动 PR

### 2. Extension 验证（路径 A）

- `specify init test-project --ai copilot` → 运行 SDD 命令生成本地产物
- `/speckit.gh-sync` → 验证 Issues/Project 同步

### 3. 幂等性验证

- 多次同步不重复创建 Issue

### 4. 混合模式验证

- A 生成 spec → B 的 speckit-tasks Agent 读取 → 创建 Issues

---

## 决策与权衡

| 决策 | 说明 |
|---|---|
| 双模式并行 | CLI 模式和 Custom Agent 模式不互斥，共享相同的产物格式和 GitHub 映射规则 |
| Custom Agent 优先 | 路径 B 实现成本更低（仅需 `.agent.md` 文件 + prompt 工程），建议先实现 |
| 认证策略 | CLI 模式用 `GITHUB_TOKEN`；Custom Agent 模式自动使用 GitHub 内置 `github/*` MCP |
| `github/*` MCP 权限 | Custom Agent 默认可用 github 只读工具，write 需确认仓库设置 |
| Agent Handoffs 限制 | `speckit-orchestrator` 依赖 VS Code 的 handoffs 支持；GitHub.com 上暂不支持 handoffs，需手动分步执行或用 Actions 编排 |
| 排除范围 | 不涉及 Packages/Releases；不涉及跨仓库同步 |

---

## 进一步思考

### 1. Org-level Agent 共享

是否将 Agent 定义放在 `.github-private` 仓库中，使整个 Organization 所有仓库共享？

**推荐**: 通用 Agent（specify/plan/tasks）放 org 级别，implement Agent 保持 repo 级别（因需仓库特定上下文）。

### 2. 双向同步

Issue 上人工修改后是否反向更新 spec.md？

**推荐**: 先单向（spec → Issue），后续通过 Actions webhook 实现反向同步。

### 3. Agent 自动推断

是否设置 `disable-model-invocation: false` 让 Copilot 自动根据任务上下文选择合适的 speckit Agent？

**推荐**: 早期设为 `true`（手动选择），成熟后开启自动推断。
