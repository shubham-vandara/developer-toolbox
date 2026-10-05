export const WIDTH_PRESETS = [320, 640, 1024, 1280, 1920, 3840];
export const PERCENT_PRESETS = [25, 50, 75, 150, 200];

export function scaleByPercent(width, height, percent) {
  const factor = (Number(percent) || 0) / 100;
  return {
    width: Math.max(1, Math.round(width * factor)),
    height: Math.max(1, Math.round(height * factor)),
  };
}
