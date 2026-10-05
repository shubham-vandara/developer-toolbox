import { parsePageRanges, splitEveryN } from "../../utils/pdf/pageRanges.js";

/**
 * Which page ranges become separate files.
 * mode: "ranges" (one file per comma-separated range, in the order typed),
 *       "every" (chunks of N pages) or "each" (one file per page).
 */
export function getSplitPlan({ mode, rangesText, everyN, pageCount }) {
  if (mode === "each") return { success: true, ranges: splitEveryN(pageCount, 1) };
  if (mode === "every") {
    const n = Number(everyN);
    if (!Number.isInteger(n) || n < 1) return { success: false, error: "Enter how many pages each file should have (1 or more)." };
    return { success: true, ranges: splitEveryN(pageCount, n) };
  }
  const result = parsePageRanges(rangesText, pageCount);
  return result.success ? { success: true, ranges: result.ranges } : result;
}
