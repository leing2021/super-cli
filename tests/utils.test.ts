import { describe, it, expect } from "vitest";
import { which } from "../src/utils.js";

describe("which", () => {
  it("finds a known executable", () => {
    const result = which("node");
    expect(result).toBeTruthy();
    expect(result).toContain("node");
  });

  it("returns null for nonexistent command", () => {
    const result = which("nonexistent_cmd_xyz123");
    expect(result).toBeNull();
  });

  it("handles empty string", () => {
    const result = which("");
    expect(result).toBeNull();
  });
});
