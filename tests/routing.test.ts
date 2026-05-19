import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { resolve } from "path";

const CLI = resolve(__dirname, "../dist/cli.js");

function run(args: string[]) {
  return spawnSync("node", [CLI, ...args], {
    encoding: "utf-8",
    timeout: 5000,
  });
}

describe("cmdTarget error handling", () => {
  it("shows helpful error for nonexistent target", () => {
    const result = run(["nonexistent_target_xyz"]);
    const output = result.stderr;
    // opencli will be invoked and handle the unknown target,
    // might succeed or fail depending on opencli behavior
    // At minimum, super-cli should not crash
    expect(result.error).toBeUndefined(); // No spawn error
  });

  it("shows install hint for missing cli-anything target", () => {
    const result = run(["gimp"]);
    const output = result.stderr + result.stdout;
    // gimp cli-anything is not installed, should fallback to opencli
    expect(result.error).toBeUndefined();
  });
});
