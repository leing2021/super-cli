import { execFileSync } from "child_process";
import { which } from "./utils.js";

export interface CheckResult {
  name: string;
  status: "ok" | "warning" | "error";
  version?: string;
  fix?: string;
}

export function checkNode(): CheckResult {
  try {
    const version = execFileSync("node", ["--version"], {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    return { name: "node", status: "ok", version };
  } catch {
    return {
      name: "node",
      status: "error",
      fix: "Install Node.js from https://nodejs.org",
    };
  }
}

export function checkPython(): CheckResult {
  for (const cmd of ["python3", "python"]) {
    try {
      const version = execFileSync(cmd, ["--version"], {
        encoding: "utf-8",
        timeout: 5000,
      }).trim();
      return { name: "python", status: "ok", version };
    } catch {
      // try next
    }
  }
  return {
    name: "python",
    status: "error",
    fix: "Install Python 3.10+ from https://python.org or brew install python",
  };
}

export function checkOpencli(): CheckResult {
  try {
    const version = execFileSync("opencli", ["--version"], {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
    return { name: "opencli", status: "ok", version };
  } catch {
    return {
      name: "opencli",
      status: "error",
      fix: "Install: npm install -g @jackwener/opencli",
    };
  }
}

export function checkCliHub(): CheckResult {
  const path = which("cli-hub");
  if (path) {
    try {
      const version = execFileSync("cli-hub", ["--version"], {
        encoding: "utf-8",
        timeout: 10000,
      }).trim();
      return { name: "cli-hub", status: "ok", version };
    } catch {
      return { name: "cli-hub", status: "ok", version: "unknown" };
    }
  }
  return {
    name: "cli-hub",
    status: "error",
    fix: "Install: pip install cli-anything-hub",
  };
}

export function runDiagnostics(): CheckResult[] {
  return [checkNode(), checkOpencli(), checkPython(), checkCliHub()];
}
