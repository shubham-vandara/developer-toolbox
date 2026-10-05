import { anchorCenter } from "../../utils/pdf/geometry.js";
import { textHeight } from "../../utils/pdf/stamp.js";

export const NUMBER_POSITIONS = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

/**
 * Which pages get which number. `pages` = pages in scope (1-based, sorted);
 * numbering begins at `startPage` (e.g. 3 to skip a cover and contents page)
 * with the value `startNumber`. `total` is the last number used, for "of N".
 */
export function planPageNumbers({ pages, startPage = 1, startNumber = 1 }) {
  const numbered = pages.filter((page) => page >= startPage);
  const plan = numbered.map((page, index) => ({ page, number: startNumber + index }));
  return { plan, total: plan.length ? plan[plan.length - 1].number : 0 };
}

/** Center of the label in viewer space. */
export function numberCenter(position, viewer, textWidth, size, margin) {
  return anchorCenter(position, viewer.width, viewer.height, textWidth, textHeight(size), margin);
}
