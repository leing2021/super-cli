---
name: supercli-index
description: >-
  Agent 可操控的 CLI 总索引。在线网站/浏览器用 opencli，
  离线桌面软件用 cli-anything-*。先读此 skill 了解全景。
  Use when the agent needs to interact with websites, browsers, Electron apps,
  or desktop GUI software and you need to decide which tool to use.
---

# SuperCLI Index

Agent 有两组 CLI 工具可用，覆盖在线和离线两个世界。

## 选择原则

```
目标是什么？
├── 网站 / Web 应用 / 浏览器 / Electron 应用 → opencli
└── 桌面 GUI 软件（Blender, GIMP, Inkscape...） → cli-anything-*
```

---

## 在线世界 → opencli

安装（需要 Node.js ≥ 21）：
```bash
npm install -g @jackwener/opencli
opencli doctor  # 验证浏览器桥接
```

能力：
- 100+ 网站适配器（bilibili、twitter、reddit、hackernews...）
- 浏览器操控（驱动已登录 Chrome：导航、填表、点击、提取）
- Electron 桌面应用控制（Cursor、ChatGPT...）
- CLI Hub（注册 gh、docker 等外部工具）

调用格式：
```bash
opencli <site> <command> -f json
opencli browser <session> <subcommand>  # 浏览器操控
```

安装 Pi Skills：
```bash
npx skills add jackwener/opencli -g -y
```

---

## 离线世界 → cli-anything-*

安装（需要 Python ≥ 3.10）：
```bash
pip install cli-anything-<software>
```

能力：
- 50+ 桌面软件 CLI（Blender、GIMP、Inkscape、Kdenlive、LibreOffice...）
- 每个软件独立安装、独立使用
- 支持 --json 输出、REPL 模式、undo/redo

调用格式：
```bash
cli-anything-<software> --json <command>
cli-anything-<software>  # 进入 REPL
```

发现已安装的 harness：
```bash
pip list | grep cli-anything
which cli-anything-*
```

---

## 安全部署

浏览器敏感操作前确认：
- opencli 浏览器操控使用用户已登录 Chrome，凭证不离开浏览器
- cli-anything 操作的是本地文件，不涉及网络凭证

## 更多

- OpenCLI 详见 skill：opencli-usage、opencli-browser、opencli-adapter-author
- CLI-Anything 详见各软件的 skill：cli-anything-blender、cli-anything-gimp 等
