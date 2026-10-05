// Crop geometry in source-image pixels. Pure functions so the interactive
// cropper stays simple and the math can be unit-tested.

export const ASPECT_PRESETS = [
  { value: "free", label: "Free", ratio: null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
];

export const MIN_CROP_SIZE = 8;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// A centered crop covering ~80% of the image, matching `aspect` when given.
export function createInitialCrop(imageWidth, imageHeight, aspect, coverage = 0.8) {
  let width = imageWidth * coverage;
  let height = imageHeight * coverage;
  if (aspect) {
    if (width / height > aspect) width = height * aspect;
    else height = width / aspect;
  }
  return {
    x: (imageWidth - width) / 2,
    y: (imageHeight - height) / 2,
    width,
    height,
  };
}

export function moveCrop(crop, dx, dy, bounds) {
  return {
    ...crop,
    x: clamp(crop.x + dx, 0, bounds.width - crop.width),
    y: clamp(crop.y + dy, 0, bounds.height - crop.height),
  };
}

/**
 * Resize from a handle ("n", "se", "w", …) by (dx, dy) image pixels, keeping
 * the opposite edge/corner anchored and the crop inside the image.
 */
export function resizeCrop(start, handle, dx, dy, bounds, aspect, min = MIN_CROP_SIZE) {
  const left = start.x;
  const top = start.y;
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");

  if (!aspect) {
    const x1 = west ? clamp(left + dx, 0, right - min) : left;
    const x2 = east ? clamp(right + dx, left + min, bounds.width) : right;
    const y1 = north ? clamp(top + dy, 0, bottom - min) : top;
    const y2 = south ? clamp(bottom + dy, top + min, bounds.height) : bottom;
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  const minWidth = Math.max(min, min * aspect);
  const fit = (width, maxWidth) => (maxWidth < minWidth ? maxWidth : clamp(width, minWidth, maxWidth));

  if ((west || east) && (north || south)) {
    const anchorX = west ? right : left;
    const anchorY = north ? bottom : top;
    const proposedWidth = start.width + (west ? -dx : dx);
    const proposedHeight = start.height + (north ? -dy : dy);
    const maxWidth = Math.min(west ? anchorX : bounds.width - anchorX, (north ? anchorY : bounds.height - anchorY) * aspect);
    // Follow whichever axis the pointer moved further along (grow or shrink).
    const followX = Math.abs(dx) >= Math.abs(dy) * aspect;
    const width = fit(followX ? proposedWidth : proposedHeight * aspect, maxWidth);
    const height = width / aspect;
    return { x: west ? anchorX - width : anchorX, y: north ? anchorY - height : anchorY, width, height };
  }

  if (west || east) {
    const anchorX = west ? right : left;
    const centerY = top + start.height / 2;
    const maxWidth = Math.min(west ? anchorX : bounds.width - anchorX, 2 * Math.min(centerY, bounds.height - centerY) * aspect);
    const width = fit(start.width + (west ? -dx : dx), maxWidth);
    const height = width / aspect;
    return { x: west ? anchorX - width : anchorX, y: centerY - height / 2, width, height };
  }

  const anchorY = north ? bottom : top;
  const centerX = left + start.width / 2;
  const maxWidth = Math.min((north ? anchorY : bounds.height - anchorY) * aspect, 2 * Math.min(centerX, bounds.width - centerX));
  const width = fit((start.height + (north ? -dy : dy)) * aspect, maxWidth);
  const height = width / aspect;
  return { x: centerX - width / 2, y: north ? anchorY - height : anchorY, width, height };
}

// Integer pixel rectangle that stays inside the image.
export function roundCrop(crop, bounds) {
  const x = clamp(Math.round(crop.x), 0, bounds.width - 1);
  const y = clamp(Math.round(crop.y), 0, bounds.height - 1);
  return {
    x,
    y,
    width: clamp(Math.round(crop.width), 1, bounds.width - x),
    height: clamp(Math.round(crop.height), 1, bounds.height - y),
  };
}
