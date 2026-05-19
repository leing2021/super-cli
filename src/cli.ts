#!/usr/bin/env node
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { OpencliTarget, CliAnythingEntry } from "./registry.js";
import { aggregateTargets } from "./registry.js";
import { resolveTarget } from "./router.js";
import { which } from "./utils.js";
import { runDiagnostics } from "./doctor.js";
import { classifySource } from "./make.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const HELP = `super-cli — 极简 CLI 路由器

Usage: super-cli <command> [args...]

Commands:
  list            列出所有可用目标
  doctor          诊断环境状态
  make <source>   为新目标生成 CLI
  <target> [args] 自动路由到正确后端，执行目标命令

Examples:
  super-cli list -f json
  super-cli doctor -f json
  super-cli hackernews top -f json
  super-cli make https://xiaohongshu.com
`;

export type CliCommand = "list" | "doctor" | "make" | "help" | "target";

export interface ParsedArgs {
  command: CliCommand;
  target?: string;
  args: string[];
}

/** 解析命令行参数，不依赖 process.exit */
export function parse(rawArgs: string[]): ParsedArgs {
  if (rawArgs.length === 0 || rawArgs.includes("--help") || rawArgs.includes("-h")) {
    return { command: "help", args: [] };
  }

  const builtins = ["list", "doctor", "make"] as const;
  if (builtins.includes(rawArgs[0] as any)) {
    return { command: rawArgs[0] as CliCommand, args: rawArgs.slice(1) };
  }

  return { command: "target", target: rawArgs[0], args: rawArgs.slice(1) };
}

function getOpencliTargets(): OpencliTarget[] {
  try {
    const output = execFileSync("opencli", ["list", "-f", "json"], {
      encoding: "utf-8",
      timeout: 10000,
    });
    const raw = JSON.parse(output);
    return raw.map((a: any) => ({
      name: `${a.site}/${a.name}`,
      type: "web" as const,
      backend: "opencli" as const,
      description: a.description || `${a.site} ${a.name}`,
      installed: true,
    }));
  } catch (e: any) {
    const notFound = e.code === "ENOENT" || e.status === 127;
    if (!notFound) {
      console.error(`Warning: opencli list failed: ${e.message || e}`);
    }
    return [];
  }
}

function getCliAnythingRegistry(): CliAnythingEntry[] {
  try {
    const registryPath = resolve(__dirname, "..", "registries", "cli-anything.json");
    return JSON.parse(readFileSync(registryPath, "utf-8"));
  } catch {
    return [];
  }
}

function cmdDoctor(args: string[]) {
  const results = runDiagnostics();
  if (isJsonMode(args)) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      const icon = r.status === "ok" ? "✓" : r.status === "warning" ? "⚠" : "✗";
      console.log(`  ${icon} ${r.name.padEnd(12)} ${r.version || "N/A"}`);
      if (r.fix) {
        console.log(`    → ${r.fix}`);
      }
    }
  }
}

function cmdMake(source: string) {
  if (!source) {
    console.error("Usage: super-cli make <source>");
    console.error("  source: website URL or GitHub repo URL");
    process.exit(1);
  }
  const result = classifySource(source);
  console.log(result.guidance);
}

function isJsonMode(args: string[]): boolean {
  return (
    args.includes("-f") && args.includes("json") ||
    args.includes("--format") && args.includes("json")
  );
}

function cmdList(args: string[]) {
  const opencliTargets = getOpencliTargets();
  const cliAnythingEntries = getCliAnythingRegistry();
  const targets = aggregateTargets(opencliTargets, cliAnythingEntries);

  // Mark CLI-Anything targets as installed if their entry_point is on PATH
  for (const t of targets) {
    if (t.backend === "cli-anything") {
      t.installed = which(`cli-anything-${t.name}`) !== null;
    }
  }

  if (isJsonMode(args)) {
    console.log(JSON.stringify(targets, null, 2));
  } else {
    for (const t of targets) {
      const icon = t.installed ? "✓" : "✗";
      const typeLabel = t.type === "web" ? "[web]" : "[desktop]";
      console.log(`  ${icon} ${t.name.padEnd(25)} ${typeLabel.padEnd(10)} ${t.description}`);
    }
  }
}

function cmdTarget(target: string, args: string[]) {
  const installed = which(`cli-anything-${target}`) !== null;
  const plan = resolveTarget(target, args, installed);

  try {
    const result = execFileSync(plan.command, plan.args, {
      encoding: "utf-8",
      stdio: "inherit",
      timeout: 30000,
    });
    if (result) process.stdout.write(result);
  } catch (e: any) {
    // Handle command-not-found (ENOENT) or shell 127
    if (e.code === "ENOENT" || e.status === 127) {
      console.error(`Error: ${plan.command} not found.`);
      if (plan.backend === "cli-anything") {
        const entry = getCliAnythingRegistry().find(
          (r: any) => r.name === target
        );
        if (entry?.install_cmd) {
          console.error(`Install: ${entry.install_cmd}`);
        }
      }
      process.exit(1);
    }
    // Handle timeout
    if (e.code === "ETIMEDOUT") {
      console.error(`Error: ${plan.command} timed out after 30s.`);
      process.exit(124);
    }
    // Pass through backend's exit code
    if (e.status != null) {
      process.exit(e.status);
    }
    // Unexpected error
    console.error(`Error: failed to execute ${plan.command}: ${e.message}`);
    process.exit(1);
  }
}

function main() {
  const parsed = parse(process.argv.slice(2));

  switch (parsed.command) {
    case "help":
      console.log(HELP);
      process.exit(0);
    case "list":
      cmdList(parsed.args);
      process.exit(0);
    case "doctor":
      cmdDoctor(parsed.args);
      process.exit(0);
    case "make":
      cmdMake(parsed.args[0] || "");
      process.exit(0);
    case "target":
      cmdTarget(parsed.target!, parsed.args);
      process.exit(0);
  }
}

const isMain = process.argv[1]?.includes("cli.js");
if (isMain) {
  main();
}
