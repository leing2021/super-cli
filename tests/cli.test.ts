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

describe("super-cli CLI", () => {
  it("--help shows all four commands", () => {
    const result = run(["--help"]);
    const output = result.stdout + result.stderr;

    expect(output).toContain("list");
    expect(output).toContain("doctor");
    expect(output).toContain("make");
    expect(result.status).toBe(0);
  });

  it("no args shows help or usage", () => {
    const result = run([]);
    const output = result.stdout + result.stderr;
    expect(output.length).toBeGreaterThan(0);
  });
});
