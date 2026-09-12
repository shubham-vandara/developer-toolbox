function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function percentOf(percent, total) {
  const p = toNumber(percent);
  const t = toNumber(total);
  if (p === null || t === null) return { success: false, error: "Enter valid numbers." };
  return { success: true, value: (p / 100) * t };
}

export function whatPercent(part, total) {
  const p = toNumber(part);
  const t = toNumber(total);
  if (p === null || t === null) return { success: false, error: "Enter valid numbers." };
  if (t === 0) return { success: false, error: "The total cannot be zero." };
  return { success: true, value: (p / t) * 100 };
}

export function percentChange(from, to) {
  const f = toNumber(from);
  const t = toNumber(to);
  if (f === null || t === null) return { success: false, error: "Enter valid numbers." };
  if (f === 0) return { success: false, error: "The starting value cannot be zero." };
  return { success: true, value: ((t - f) / Math.abs(f)) * 100 };
}
