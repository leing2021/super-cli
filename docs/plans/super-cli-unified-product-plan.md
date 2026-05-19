# super-cli unified product plan

> Date: 2026-05-18 (revised)
> Workflow: Super Pi `02-plan`
> Requirements artifact: `docs/brainstorms/super-cli-unified-product.md`
> Status: ready for `03-work`; implementation not started

## Problem summary

`super-cli` 是一个**极简 CLI 路由器**。用户安装后获得一个统一入口，命令自动路由到 OpenCLI 或 CLI-Anything 后端。

```bash
npm install -g super-cli
super-cli list
super-cli doctor
super-cli <target> [args...]
super-cli make <source>
```

核心定位：**路由器，不是运行时管家。** super-cli 不管理 Python 环境，不 lazy install harness，不引入上游的 57 个 Skills。

### 与旧计划的关键差异

旧计划（被本文替代）的三个过度工程化设计：

1. **Python 环境管理**（`python-env.ts` + `lazy-install.ts` + `locks.ts`）→ **砍掉**。CLI-Anything 自带 `cli-hub install`，super-cli 不重复造轮子。
2. **CLI-Anything 的 57 个 Skills 全部引入** → **砍掉**。57 条 description = 3000-5000 tokens 常驻上下文，违反极简原则。只引入 `registry.json` 数据。
3. **9 个 TDD Unit / 20+ 源文件** → **精简为 4 个 Unit / ~10 个源文件**。MVP 总代码量约 500-800 行 TypeScript。

## Relevant learnings

- `~/.pi/agent/docs/solutions/tooling/2026-04-23-adapting-claude-cli-skill-to-pi-dual-cli.md` — 后端检测/路由保持可测试，Skill 作为指引不是运行时。
- `~/.pi/agent/docs/solutions/integration/2026-04-17-npm-publish-github-actions.md` — CI/npm 发布需显式 auth 配置。
- `~/.pi/agent/docs/solutions/tooling/git-tag-sync-on-release.md` — npm 版本与 git tag 同步。
- CLI-Anything 已有 `cli-hub` 包管理器（`pip install cli-anything-hub`），提供 `list`/`search`/`install`/`update`/`uninstall` 命令。super-cli 不需要重新实现安装管理。

## Scope boundaries

### In scope

- npm 包入口，`super-cli` bin
- 命令解析器：`list` / `doctor` / `<target>` / `make`
- OpenCLI 作为 npm dependency，通过 subprocess 调用
- CLI-Anything registry.json 快照作为 `list` 的数据源
- CLI-Anything target 通过 `which("cli-anything-<target>")` 检测 + subprocess 转发
- `doctor` 检测环境，输出结构化状态和修复建议
- `make` 分类 source 类型，委托上游 authoring 工具或打印指引
- 更新 README 和 SKILL.md

### Out of scope

- Python 环境管理（检测 + 提示，不替用户安装）
- lazy install harness（由 cli-hub 或 pip 负责）
- 引入 CLI-Anything 的 57 个 Skills
- 重写 OpenCLI adapter 或 CLI-Anything Python harness
- Pi extension
- JSON output normalization（透传后端输出）
- `--backend` escape hatch（MVP 不处理同名冲突）

## Architecture

```
super-cli executable (~500-800 行 TypeScript)
  ├── cli.ts              命令解析入口
  ├── router.ts           target → 后端路由
  │   ├── OpenCLI 路由:   exec("opencli", [target, ...args])
  │   └── CLI-Anything:   exec("cli-anything-<target>", args)
  ├── registry.ts         list 的数据源聚合
  │   ├── OpenCLI:        读 npm dependency 本地路径的 adapter manifest
  │   └── CLI-Anything:   读内置 registries/cli-anything.json
  ├── doctor.ts           环境诊断
  │   ├── Node/npm 版本
  │   ├── OpenCLI 可用性 + 版本
  │   ├── Python 可用性 + 版本
  │   └── cli-hub 可用性
  ├── runner.ts           subprocess 执行器（injectable，可 mock）
  └── make.ts             source 分类 + 委托/指引
```

### 核心路由逻辑

```typescript
// router.ts — 极简路由，约 30 行
function route(target: string, args: string[]): ExecPlan {
  // 1. 桌面软件优先：检查 cli-anything-<target> 是否存在
  const cliAnythingBin = `cli-anything-${target}`;
  if (which(cliAnythingBin)) {
    return { command: cliAnythingBin, args };
  }
  // 2. 否则转发给 OpenCLI
  return { command: "opencli", args: [target, ...args] };
}
```

### CLI-Anything 数据来源

```json
// registries/cli-anything.json — 从上游 registry.json 提取精简版
[
  {
    "name": "blender",
    "description": "3D scene editing via CLI",
    "entry_point": "cli-anything-blender",
    "category": "3d",
    "install_cmd": "cli-hub install blender"
  }
]
```

## Directory structure

```
super-cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts                # bin 入口 + 命令解析
│   ├── router.ts             # target 路由
│   ├── registry.ts           # list 数据聚合
│   ├── doctor.ts             # 环境诊断
│   ├── runner.ts             # subprocess 执行器
│   └── make.ts               # make 命令
├── registries/
│   └── cli-anything.json     # CLI-Anything registry 精简快照
├── tests/
│   ├── router.test.ts
│   ├── registry.test.ts
│   ├── doctor.test.ts
│   ├── runner.test.ts
│   └── fixtures/             # fake bin, mock manifests
├── skills/
│   └── super-cli/SKILL.md    # 单一 skill，~40 行
├── docs/
│   ├── brainstorms/
│   ├── plans/
│   └── report/
└── README.md
```

## Command design

### `super-cli list`

```bash
super-cli list                # 全部目标
super-cli list --type web     # 只列网站（OpenCLI）
super-cli list --type desktop # 只列桌面软件（CLI-Anything）
super-cli list --installed    # 只列已安装的
super-cli list -f json        # JSON 输出
```

数据来源：
- OpenCLI targets：读 OpenCLI npm dependency 本地的 adapter manifest
- CLI-Anything targets：读 `registries/cli-anything.json`
- 已安装状态：`which()` 检测 entry_point 是否在 PATH

### `super-cli doctor`

```bash
super-cli doctor              # 文本报告
super-cli doctor -f json      # JSON 输出
```

检查项：
1. Node.js 版本
2. npm 版本
3. OpenCLI 可用性 + 版本（读 npm dependency local bin）
4. Python 可用性 + 版本（`python3 --version`）
5. cli-hub 可用性（`which cli-hub`）

每个检查输出 `{ name, status: "ok"|"warning"|"error", version?, fix? }`。

不自动修复，只输出诊断和建议。

### `super-cli <target> [args...]`

路由逻辑：
1. `browser` 保留字 → `opencli browser [args...]`
2. `which("cli-anything-<target>")` 存在 → 执行该命令
3. 否则 → `opencli <target> [args...]`
4. 都失败 → 错误信息 + 提示 `super-cli list | grep <target>` 和 `cli-hub install <target>`

### `super-cli make <source>`

MVP 行为（极简版）：
1. 判断 source 类型（URL / GitHub repo / local path）
2. 网站 URL → 打印 OpenCLI adapter authoring 指引
3. GitHub repo → 打印 CLI-Anything harness authoring 指引
4. 不自动调用上游 authoring 工具（待验证后升级）

## Packaging

1. `super-cli` 发布为 npm 包，bin 名 `super-cli`
2. OpenCLI 声明为 `dependencies`（如果 license 和包结构允许）
3. `registries/cli-anything.json` 内置在包中
4. 无 postinstall 钩子
5. 无 Python 环境管理代码

## SKILL.md 设计

```yaml
---
name: super-cli
description: >-
  统一 CLI 路由器。当需要操控网站(bilibili/zhihu/twitter等)、
  浏览器、Electron应用、或桌面GUI软件(Blender/GIMP等)时使用。
  先运行 super-cli list 发现所有可用目标，再用 super-cli <target> 调用。
---
```

```markdown
# super-cli

## 快速开始
super-cli list -f json           # 发现所有可用目标
super-cli <target> --help        # 查看目标的具体命令
super-cli <target> [args] -f json  # 标准调用

## 关键规则
- 始终使用 -f json 获取结构化输出
- 目标不确定时：super-cli list | grep <关键词>
- 环境异常时：super-cli doctor -f json
- 需要新 target 时：super-cli make <url>

## make 生成新 CLI
super-cli make <网站URL或GitHub地址>

## 约束
- 浏览器操控需要 Chrome 扩展（doctor 检查）
- 桌面软件需要软件已安装 + Python 3.10+
- 桌面 CLI 安装：cli-hub install <target> 或 pip install cli-anything-<target>
```

**约 30 行。** Agent 看到 description → 知道何时用。Read SKILL.md → 知道怎么用。具体命令 → `--help`。零浪费。

## Testing strategy

- 测试框架：vitest（随 scaffold 一起建立）
- runner.ts 使用 injectable subprocess 接口，所有测试用 fake bin
- 不需要网络、浏览器、真实 GUI 软件、Python 环境
- 覆盖率目标 80%+

## TDD implementation units

### Unit 1 — 项目脚手架 + CLI 解析器

**Goal**: 可执行的 `super-cli` bin，支持 `--help` 输出四个命令。

**Files**: `package.json`, `tsconfig.json`, `src/cli.ts`, `tests/cli.test.ts`

**TDD**:
- RED: 测试 `super-cli --help` 包含 `list`, `doctor`, `make`
- GREEN: 最小实现
- REFACTOR: 分离命令解析和进程退出

**Verification**: `npm test && npm run build && node dist/cli.js --help`

---

### Unit 2 — 路由器 + list

**Goal**: target 路由逻辑 + `list` 命令聚合两个数据源。

**Files**: `src/router.ts`, `src/registry.ts`, `src/runner.ts`, `registries/cli-anything.json`, `tests/router.test.ts`, `tests/registry.test.ts`, `tests/fixtures/`

**TDD**:
- RED: 路由测试（`browser` → opencli, `blender` 且 which 存在 → cli-anything, 未知 → opencli, 全失败 → 错误提示）；list 测试（读 fixture manifest + json → 标准化输出）
- GREEN: 实现路由 + registry 聚合 + runner subprocess 封装
- REFACTOR: 提取 provider 接口

**Verification**: `npm test && node dist/cli.js list -f json`

**Dependencies**: Unit 1

---

### Unit 3 — doctor + make

**Goal**: 环境诊断 + make 分类。

**Files**: `src/doctor.ts`, `src/make.ts`, `tests/doctor.test.ts`, `tests/make.test.ts`

**TDD**:
- RED: doctor 测试（mock 各种探测结果 → 正确的状态 JSON）；make 测试（URL 分类 → opencli 指引, GitHub repo → cli-anything 指引, 无效输入 → 错误）
- GREEN: 实现 doctor 探测 + make 分类
- REFACTOR: 统一状态 schema

**Verification**: `npm test && node dist/cli.js doctor -f json`

**Dependencies**: Unit 1, Unit 2

---

### Unit 4 — 文档 + 发布准备

**Goal**: 更新 README、SKILL.md，验证 npm pack 内容。

**Files**: `README.md`, `skills/super-cli/SKILL.md`, `package.json`（files/bin 配置）

**TDD**:
- RED: 测试 README 不再要求用户手动安装 opencli；`npm pack --dry-run` 包含 dist/、registries/、README
- GREEN: 更新文档和打包配置
- REFACTOR: 命令示例与实际 CLI 对齐

**Verification**: `npm test && npm run build && npm pack --dry-run`

**Dependencies**: Unit 1-3

## Risk and mitigation

| Risk | Mitigation |
|------|-----------|
| OpenCLI npm 包名未确认 | Unit 1 开始前验证；如果包名不同，只改一处配置 |
| OpenCLI adapter manifest 发现机制不明 | 先用 fixture 测试，接口设计为可替换 |
| CLI-Anything registry.json 格式变化 | 使用宽松解析，忽略缺失字段 |
| Python 不在用户机器上 | doctor 输出 `fix` 提示，不自动安装 |
| target name 冲突（OpenCLI 和 CLI-Anything 同名） | MVP 不处理，桌面优先；后续可加 `--backend` |

## Stage milestones

| Milestone | Units | 产出 |
|-----------|-------|------|
| M1：核心骨架 | Unit 1-2 | `super-cli --help`、`list`、路由可用 |
| M2：完整体验 | Unit 3 | `doctor`、`make` 可用 |
| M3：发布就绪 | Unit 4 | README/SKILL.md 更新，npm pack 验证 |

## Official documentation checks required

实施前必须验证（30 分钟验证 sprint）：

1. OpenCLI npm 包名、license、bin 路径
2. OpenCLI adapter manifest/list 获取方式
3. CLI-Anything `registry.json` 字段稳定性
4. `cli-hub` 的 `pip install cli-anything-hub` 是否可用

## Verification strategy

- Planning phase: 已读取仓库全部现有文件和 CLI-Anything 源码
- Implementation phase: 每个 Unit 的 TDD 门禁

## Next step

```text
/skill:03-work docs/plans/super-cli-unified-product-plan.md
```

Do not start implementation until the user explicitly approves.
