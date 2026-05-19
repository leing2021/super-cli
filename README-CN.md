# super-cli

[English](README.md)

极简 CLI 路由器 — 一个命令操控网站、浏览器、Electron 应用和桌面 GUI 软件。

```bash
npm install -g super-cli
super-cli list              # 发现所有可用目标
super-cli doctor            # 检查运行环境
super-cli hackernews top -f json
super-cli make https://xiaohongshu.com
```

## 是什么

`super-cli` 是一个统一入口，将你的命令自动路由到正确的后端：

- **[OpenCLI](https://github.com/jackwener/opencli)** — 操控网站、浏览器、Electron 应用（100+ 适配器）
- **[CLI-Anything](https://github.com/HKUDS/CLI-Anything)** — 操控已安装的桌面 GUI 软件，如 Blender、GIMP、Inkscape（60+ harness）

只需记住 `super-cli`，不用关心后端是谁。

> **注意：** OpenCLI 随 super-cli 自动安装。CLI-Anything harness 需要额外一次性配置 — 见[安装](#安装)章节。

## 快速开始

```bash
# 1. 安装
npm install -g super-cli

# 2. 看看有什么可用目标
super-cli list

# 3. 使用目标
super-cli hackernews top -f json       # OpenCLI 目标
super-cli blender --json scene info    # CLI-Anything 目标（需先安装 cli-hub）
```

## 路由逻辑

```
super-cli <target> [args]
        │
        ├── target = "browser"        → opencli browser [args]
        ├── cli-anything-<target> 在 PATH 中 → 直接执行
        └── 其他                     → opencli <target> [args]
```

桌面软件目标在运行时检测。如果系统已安装 `cli-anything-<target>`，`super-cli` 优先使用它；否则回退到 OpenCLI。

## 命令

| 命令 | 说明 |
|---|---|
| `super-cli list` | 列出所有可用目标（网站 + 桌面软件） |
| `super-cli doctor` | 诊断 Node、Python、OpenCLI、cli-hub 环境 |
| `super-cli <target> [args]` | 对目标执行命令（自动路由到正确后端） |
| `super-cli make <source>` | 获取创建新 CLI 适配器的指引（网站→OpenCLI，GitHub 项目→CLI-Anything） |

所有命令都支持 `-f json` 输出结构化结果。

## 使用示例

```bash
# 发现可用目标
super-cli list -f json
super-cli list --type web
super-cli list --type desktop

# 检查环境
super-cli doctor -f json

# 操控网站
super-cli zhihu search "TypeScript" -f json
super-cli twitter user elonmusk -f json

# 操控桌面软件（需先安装 cli-hub）
cli-hub install blender
super-cli blender --json scene info
```

## 创建新目标

使用 `super-cli make` 获取为新目标创建 CLI 适配器的指引：

```bash
# 网站 → 获取 OpenCLI 适配器编写指引
super-cli make https://xiaohongshu.com

# GitHub 开源项目 → 获取 CLI-Anything harness 编写指引
super-cli make https://github.com/blender/blender
```

`make` 命令只打印分步指引。具体的适配器/harness 由上游工具（OpenCLI 或 CLI-Anything）创建，super-cli 本身不执行生成。

## 安装

### 前置依赖

| 依赖 | 是否必须 | super-cli 自带？ |
|---|---|---|
| **Node.js** 18+ | 必须 | — |
| **OpenCLI** | 网站目标需要 | ✅ npm 自动安装 |
| **Python** 3.10+ | 仅 CLI-Anything 目标需要 | ❌ 需单独安装 |
| **cli-hub** | 仅 CLI-Anything 目标需要 | ❌ `pip install cli-anything-hub` |

### 第一步：安装 super-cli（含 OpenCLI）

```bash
npm install -g super-cli
```

安装后，`super-cli hackernews top -f json` 及所有网站/浏览器目标立即可用。

### 第二步：配置 CLI-Anything（仅桌面软件目标需要）

如果要操控桌面 GUI 软件（如 Blender、GIMP），需一次性安装 CLI-Anything 生态：

```bash
# 安装 CLI-Anything 包管理器
pip install cli-anything-hub

# 安装你需要的桌面软件 CLI harness
cli-hub install blender
cli-hub install gimp
```

现在 `super-cli blender --json scene info` 即可使用。

如果只使用网站/浏览器目标，跳过此步。

## 开发

```bash
git clone https://github.com/user/super-cli.git
cd super-cli
npm install
npm run build      # 编译 TypeScript
npm test           # 运行 40 个 vitest 测试
```

## 项目结构

```text
super-cli/
├── src/
│   ├── cli.ts          # 入口 + 参数解析
│   ├── router.ts       # target → 后端路由逻辑
│   ├── registry.ts     # 目标列表聚合
│   ├── doctor.ts       # 环境诊断
│   ├── runner.ts       # 子进程执行计划
│   ├── make.ts         # make 命令（来源分类）
│   └── utils.ts        # 跨平台 which()
├── registries/
│   └── cli-anything.json  # 桌面目标注册表快照
├── skills/
│   └── super-cli/SKILL.md # AI Agent 发现技能
├── tests/              # 9 个测试文件，40 个 vitest 用例
└── docs/
    ├── brainstorms/    # 产品需求文档
    ├── plans/          # 实施计划
    └── report/         # 分析报告
```

## AI Agent 使用说明

`super-cli` 同时面向人类和 AI Agent 设计。Agent 应：

1. 阅读 `skills/super-cli/SKILL.md` 了解何时使用 super-cli
2. 运行 `super-cli list -f json` 发现可用目标
3. 运行 `super-cli <target> --help` 查看目标的具体命令
4. 始终使用 `-f json` 获取结构化输出

## 许可证

MIT。后端工具有独立的许可证（OpenCLI: Apache-2.0，CLI-Anything: Apache-2.0）。
