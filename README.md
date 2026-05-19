# super-cli

[简体中文](README-CN.md)

A minimalist CLI router — one command to control websites, browsers, Electron apps, and desktop GUI software.

```bash
npm install -g super-cli
super-cli list              # discover all available targets
super-cli doctor            # check your environment
super-cli hackernews top -f json
super-cli make https://xiaohongshu.com
```

## What it does

`super-cli` is a unified entry point that automatically routes your commands to the right backend:

- **[OpenCLI](https://github.com/jackwener/opencli)** — controls websites, browsers, and Electron apps (100+ adapters)
- **[CLI-Anything](https://github.com/HKUDS/CLI-Anything)** — controls installed desktop GUI software like Blender, GIMP, and Inkscape (60+ harnesses)

Remember `super-cli`. Forget which backend does what.

> **Note:** OpenCLI comes bundled with `super-cli`. CLI-Anything harnesses require a separate one-time setup — see [Installation](#installation).

## Quickstart

```bash
# 1. Install
npm install -g super-cli

# 2. See what's available
super-cli list

# 3. Use a target
super-cli hackernews top -f json       # OpenCLI target
super-cli blender --json scene info    # CLI-Anything target (requires cli-hub)
```

## Routing

```
super-cli <target> [args]
        │
        ├── target = "browser"        → opencli browser [args]
        ├── cli-anything-<target> on PATH → runs directly
        └── otherwise                  → opencli <target> [args]
```

Desktop software targets are detected at runtime. If `cli-anything-<target>` is installed, `super-cli` uses it; otherwise it falls back to OpenCLI.

## Commands

| Command | Description |
|---|---|
| `super-cli list` | List all available targets (web + desktop) |
| `super-cli doctor` | Diagnose Node, Python, OpenCLI, and cli-hub |
| `super-cli <target> [args]` | Run a command on a target (auto-routed to the right backend) |
| `super-cli make <source>` | Get guidance for creating a new CLI adapter (website → OpenCLI, GitHub project → CLI-Anything) |

All commands support structured output with `-f json`.

## Examples

```bash
# Discover targets
super-cli list -f json
super-cli list --type web
super-cli list --type desktop

# Check environment
super-cli doctor -f json

# Control a website
super-cli zhihu search "TypeScript" -f json
super-cli twitter user elonmusk -f json

# Control desktop software (requires cli-hub)
cli-hub install blender
super-cli blender --json scene info
```

## Creating new targets

Use `super-cli make` to get guidance for creating a CLI adapter for a new target:

```bash
# For a website → get OpenCLI adapter authoring guidance
super-cli make https://xiaohongshu.com

# For a GitHub open-source project → get CLI-Anything harness guidance
super-cli make https://github.com/blender/blender
```

The `make` command prints step-by-step guidance. The actual adapter/harness is created using the upstream authoring tools (OpenCLI or CLI-Anything), not by super-cli itself.

## Installation

### Prerequisites

| Dependency | Required | Bundled with super-cli? |
|---|---|---|
| **Node.js** 18+ | Yes | — |
| **OpenCLI** | Yes (for web targets) | ✅ Auto-installed via npm |
| **Python** 3.10+ | Only for CLI-Anything targets | ❌ Install separately |
| **cli-hub** | Only for CLI-Anything targets | ❌ `pip install cli-anything-hub` |

### Step 1: Install super-cli (includes OpenCLI)

```bash
npm install -g super-cli
```

After this, `super-cli hackernews top -f json` and all web/browser targets work immediately.

### Step 2: Set up CLI-Anything (for desktop software targets only)

If you want to control desktop GUI software (Blender, GIMP, etc.), install the CLI-Anything ecosystem once:

```bash
# Install the CLI-Anything package manager
pip install cli-anything-hub

# Install harnesses for the desktop software you need
cli-hub install blender
cli-hub install gimp
```

Now `super-cli blender --json scene info` works.

Skip this step if you only use web/browser targets.

## Development

```bash
git clone https://github.com/leing2021/super-cli.git
cd super-cli
npm install
npm run build      # compile TypeScript
npm test           # run 40 tests with vitest
```

## Project structure

```text
super-cli/
├── src/
│   ├── cli.ts          # entry point + argument parser
│   ├── router.ts       # target → backend routing logic
│   ├── registry.ts     # target list aggregation
│   ├── doctor.ts       # environment diagnostics
│   ├── runner.ts       # subprocess execution plan
│   ├── make.ts         # make command (source classifier)
│   └── utils.ts        # cross-platform which()
├── registries/
│   └── cli-anything.json  # desktop target registry snapshot
├── skills/
│   └── super-cli/SKILL.md # AI agent discovery skill
├── tests/              # 40 vitest tests across 9 files
└── docs/
    ├── brainstorms/    # product requirements
    ├── plans/          # implementation plan
    └── report/         # analysis reports
```

## For AI agents

`super-cli` is designed for both humans and AI agents. Agents should:

1. Read `skills/super-cli/SKILL.md` to know when to use super-cli
2. Run `super-cli list -f json` to discover available targets
3. Run `super-cli <target> --help` to see target-specific commands
4. Always use `-f json` for structured output

## License

MIT. Backend tools have independent licenses (OpenCLI: Apache-2.0, CLI-Anything: Apache-2.0).
