function isObject(value) {
  return value !== null && typeof value === "object";
}

export function diffValues(a, b, path = "") {
  const aIsObj = isObject(a);
  const bIsObj = isObject(b);

  if (aIsObj && bIsObj && Array.isArray(a) === Array.isArray(b)) {
    const isArray = Array.isArray(a);
    const keys = isArray
      ? Array.from({ length: Math.max(a.length, b.length) }, (_, i) => String(i))
      : Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));

    return keys.flatMap((key) => {
      const childPath = path ? (isArray ? `${path}[${key}]` : `${path}.${key}`) : key;
      const hasA = isArray ? Number(key) < a.length : Object.hasOwn(a, key);
      const hasB = isArray ? Number(key) < b.length : Object.hasOwn(b, key);

      if (hasA && !hasB) return [{ path: childPath, type: "removed", oldValue: a[key] }];
      if (!hasA && hasB) return [{ path: childPath, type: "added", newValue: b[key] }];
      return diffValues(a[key], b[key], childPath);
    });
  }

  if (JSON.stringify(a) !== JSON.stringify(b)) {
    return [{ path: path || "root", type: "changed", oldValue: a, newValue: b }];
  }

  return [];
}

export function summarizeDiff(changes) {
  return {
    added: changes.filter((c) => c.type === "added").length,
    removed: changes.filter((c) => c.type === "removed").length,
    changed: changes.filter((c) => c.type === "changed").length,
  };
}

export function formatDiffValue(value) {
  if (value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
