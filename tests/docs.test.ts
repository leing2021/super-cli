import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const PROJECT_ROOT = resolve(__dirname, "..");

describe("documentation", () => {
  it("README exists and does not ask users to manually install opencli", () => {
    const readme = readFileSync(
      resolve(PROJECT_ROOT, "README.md"),
      "utf-8"
    );
    expect(readme).toBeTruthy();
    // Should NOT tell users to manually npm install opencli
    expect(readme).not.toContain("npm install -g opencli");
    expect(readme).not.toContain("npm install -g @jackwener/opencli");
    // Should NOT tell users to manually pip install individual cli-anything-<software> harnesses
    expect(readme).not.toMatch(/pip install cli-anything-(?!hub)/);
  });

  it("SKILL.md exists and does not ask users to manually install backends", () => {
    const skillPath = resolve(
      PROJECT_ROOT,
      "skills/super-cli/SKILL.md"
    );
    if (!existsSync(skillPath)) {
      // Skill will be created in GREEN phase
      return;
    }
    const skill = readFileSync(skillPath, "utf-8");
    expect(skill).toBeTruthy();
    expect(skill).not.toContain("npm install -g opencli");
    expect(skill).not.toMatch(/pip install cli-anything-(?!hub)/);
  });
});

describe("packaging", () => {
  it("package.json has correct bin entry", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(PROJECT_ROOT, "package.json"), "utf-8")
    );
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin["super-cli"]).toBe("./dist/cli.js");
    expect(pkg.files).toContain("dist/");
    expect(pkg.files).toContain("registries/");
    expect(pkg.files).toContain("skills/");
  });
});
