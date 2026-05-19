export interface MakeResult {
  type: "url" | "repo" | "unknown";
  guidance: string;
}

const URL_PATTERN = /^https?:\/\//;
const GITHUB_PATTERN = /^https?:\/\/github\.com\/.+\/.+/;

export function classifySource(source: string): MakeResult {
  if (GITHUB_PATTERN.test(source)) {
    return {
      type: "repo",
      guidance: [
        "ℹ️  Detected GitHub repo. To create a desktop CLI harness:",
        "",
        "1. Review the CLI-Anything HARNESS methodology:",
        "   https://github.com/HKUDS/CLI-Anything",
        "",
        "2. Create the harness following the existing examples:",
        "   Look at blender/, gimp/, inkscape/ for reference harness structures.",
        "",
        "3. Install cli-hub for harness management:",
        "   pip install cli-anything-hub",
        "",
        "4. Build and test:",
        "   cd <harness-dir> && pip install -e .",
        "   cli-anything-<name> --help",
      ].join("\n"),
    };
  }

  if (URL_PATTERN.test(source)) {
    return {
      type: "url",
      guidance: [
        "ℹ️  Detected website URL. To create an OpenCLI adapter:",
        "",
        "1. Read the OpenCLI adapter authoring documentation:",
        "   opencli adapter --help",
        "",
        "2. Study existing adapters:",
        "   opencli list to see 100+ reference implementations.",
        "",
        "3. Create the adapter using the OpenCLI adapter CLI:",
        "   opencli adapter create <site> <url>",
        "",
        "4. Test:",
        "   opencli <site> <command> -f json",
      ].join("\n"),
    };
  }

  return {
    type: "unknown",
    guidance: [
      "⚠️  Unknown source type:",
      `  "${source}"`,
      "",
      "Expected:",
      "  • A website URL (e.g. https://xiaohongshu.com)",
      "  • A GitHub repo URL (e.g. https://github.com/blender/blender)",
      "",
      "Usage: super-cli make <source>",
    ].join("\n"),
  };
}
