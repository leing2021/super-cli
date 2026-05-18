# SuperCLI

**把任何东西变成 CLI。一个入口，网站和桌面软件通用。**

## 是什么

SuperCLI 是一个 Pi Skill，让 Agent 用统一的命令操控任何外部软件或网站，不需要知道背后是 OpenCLI 还是 CLI-Anything。

```
super-cli hackernews top -f json     # 网站 → 路由到 opencli
super-cli blender --json scene info  # 桌面 → 路由到 cli-anything-blender
super-cli browser my open https://.. # 浏览器 → 路由到 opencli browser
```

## 4 个命令

| 命令 | 用途 |
|------|------|
| `super-cli list` | 列出所有可操控目标（网站 + 桌面软件） |
| `super-cli doctor` | 检查后端状态 |
| `super-cli <target> [args...]` | 操控任意目标（自动路由） |
| `super-cli make <source>` | 为新目标生成 CLI |

## 安装

```bash
# 1. 安装 Skill（给 Pi Agent 用）
cp -r skills/super-cli ~/.pi/agent/skills/

# 2. 安装后端工具（至少装一个）
npm install -g @jackwener/opencli        # 在线后端
pip install cli-anything-<software>      # 离线后端（按需）
```

## 项目结构

```
super-cli/
├── skills/
│   └── super-cli/SKILL.md       # Pi Skill（统一入口，路由逻辑）
├── docs/
│   └── report/                  # 设计分析报告
└── README.md
```

## 路由逻辑

```
super-cli <target> <args>
        │
        ├── target = "browser"        → opencli browser <args>
        ├── target 匹配 opencli 站点   → opencli <target> <args>
        ├── target 匹配 cli-anything-* → cli-anything-<target> <args>
        └── 无匹配                     → 报错 + 安装提示
```

Agent 不需要理解路由细节——它只管 `super-cli <目标> <参数>`。

## License

SuperCLI 本身是一个 Skill（Markdown 文档），无代码。
引用的后端工具各自有独立 License：
- OpenCLI: Apache-2.0
- CLI-Anything: Apache-2.0
