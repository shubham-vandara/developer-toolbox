const MAX_CELLS = 4_000_000;

export function diffLines(oldText, newText) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const n = oldLines.length;
  const m = newLines.length;

  if (n * m > MAX_CELLS) {
    return { success: false, error: "These texts are too large to diff. Try comparing smaller sections." };
  }

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = oldLines[i] === newLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const diff = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      diff.push({ type: "unchanged", line: oldLines[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: "removed", line: oldLines[i] });
      i += 1;
    } else {
      diff.push({ type: "added", line: newLines[j] });
      j += 1;
    }
  }
  while (i < n) {
    diff.push({ type: "removed", line: oldLines[i] });
    i += 1;
  }
  while (j < m) {
    diff.push({ type: "added", line: newLines[j] });
    j += 1;
  }

  return { success: true, diff };
}

export function summarizeLineDiff(diff) {
  return {
    added: diff.filter((d) => d.type === "added").length,
    removed: diff.filter((d) => d.type === "removed").length,
    unchanged: diff.filter((d) => d.type === "unchanged").length,
  };
}

export function formatUnifiedDiff(diff) {
  const prefix = { added: "+ ", removed: "- ", unchanged: "  " };
  return diff.map((d) => `${prefix[d.type]}${d.line}`).join("\n");
}
