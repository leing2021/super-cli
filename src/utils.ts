import { execFileSync } from "child_process";

/** Cross-platform — returns path string if command exists on PATH, null otherwise. */
export function which(cmd: string): string | null {
  try {
    // Use POSIX `command -v` (works on macOS/Linux/Git Bash/WSL)
    // On native Windows, fall back to `where`
    const shellCmd = process.platform === "win32" ? ["where", cmd] : ["command", "-v", cmd];
    const result = execFileSync(shellCmd[0], shellCmd.slice(1), {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    });
    const out = result.trim();
    return out && !out.includes("not found") ? out : null;
  } catch {
    return null;
  }
}
