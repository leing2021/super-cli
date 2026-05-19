import { execFileSync } from "child_process";
import { which } from "./utils.js";
export function checkNode() {
    try {
        const version = execFileSync("node", ["--version"], {
            encoding: "utf-8",
            timeout: 5000,
        }).trim();
        return { name: "node", status: "ok", version };
    }
    catch {
        return {
            name: "node",
            status: "error",
            fix: "Install Node.js from https://nodejs.org",
        };
    }
}
export function checkPython() {
    for (const cmd of ["python3", "python"]) {
        try {
            const version = execFileSync(cmd, ["--version"], {
                encoding: "utf-8",
                timeout: 5000,
            }).trim();
            return { name: "python", status: "ok", version };
        }
        catch {
            // try next
        }
    }
    return {
        name: "python",
        status: "error",
        fix: "Install Python 3.10+ from https://python.org or brew install python",
    };
}
export function checkOpencli() {
    try {
        const version = execFileSync("opencli", ["--version"], {
            encoding: "utf-8",
            timeout: 10000,
        }).trim();
        return { name: "opencli", status: "ok", version };
    }
    catch {
        return {
            name: "opencli",
            status: "error",
            fix: "Install: npm install -g @jackwener/opencli",
        };
    }
}
export function checkCliHub() {
    const path = which("cli-hub");
    if (path) {
        try {
            const version = execFileSync("cli-hub", ["--version"], {
                encoding: "utf-8",
                timeout: 10000,
            }).trim();
            return { name: "cli-hub", status: "ok", version };
        }
        catch {
            return { name: "cli-hub", status: "ok", version: "unknown" };
        }
    }
    return {
        name: "cli-hub",
        status: "error",
        fix: "Install: pip install cli-anything-hub",
    };
}
export function runDiagnostics() {
    return [checkNode(), checkOpencli(), checkPython(), checkCliHub()];
}
