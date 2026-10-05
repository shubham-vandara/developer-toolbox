export const ZOOM_STEPS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

// Step to the next zoom level. `current` null means "fit", treated as 100%.
export function nextZoom(current, direction) {
  const value = current ?? 1;
  if (direction > 0) return ZOOM_STEPS.find((step) => step > value) ?? ZOOM_STEPS.at(-1);
  return [...ZOOM_STEPS].reverse().find((step) => step < value) ?? ZOOM_STEPS[0];
}
