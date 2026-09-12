export const GITIGNORE_TEMPLATES = [
  {
    id: "node",
    label: "Node",
    content: "node_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\ndist/\nbuild/\n.env\n.env.local\ncoverage/",
  },
  {
    id: "python",
    label: "Python",
    content: "__pycache__/\n*.py[cod]\n*.egg-info/\n.venv/\nvenv/\n.pytest_cache/\n.mypy_cache/\ndist/\nbuild/\n*.log",
  },
  {
    id: "java",
    label: "Java",
    content: "*.class\n*.jar\n*.war\ntarget/\n.gradle/\nbuild/\nout/",
  },
  {
    id: "go",
    label: "Go",
    content: "*.exe\n*.test\n*.out\nvendor/\n/bin/",
  },
  {
    id: "macos",
    label: "macOS",
    content: ".DS_Store\n.AppleDouble\n.LSOverride\n._*\n.Spotlight-V100\n.Trashes",
  },
  {
    id: "windows",
    label: "Windows",
    content: "Thumbs.db\nehthumbs.db\nDesktop.ini\n$RECYCLE.BIN/\n*.lnk",
  },
  {
    id: "vscode",
    label: "Visual Studio Code",
    content: ".vscode/*\n!.vscode/settings.json\n!.vscode/tasks.json\n!.vscode/launch.json\n!.vscode/extensions.json",
  },
  {
    id: "jetbrains",
    label: "JetBrains (IntelliJ / WebStorm)",
    content: ".idea/\n*.iml\n*.iws\nout/",
  },
];

export function buildGitignore(selectedIds) {
  const lines = [];
  const seen = new Set();

  for (const id of selectedIds) {
    const template = GITIGNORE_TEMPLATES.find((t) => t.id === id);
    if (!template) continue;

    lines.push(`### ${template.label} ###`);
    for (const line of template.content.split("\n")) {
      const key = line.trim();
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      lines.push(line);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
