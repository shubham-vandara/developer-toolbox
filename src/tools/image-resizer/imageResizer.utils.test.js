import { describe, expect, it } from "vitest";
import { scaleByPercent } from "./imageResizer.utils.js";

describe("scaleByPercent", () => {
  it("scales both sides", () => {
    expect(scaleByPercent(1920, 1080, 50)).toEqual({ width: 960, height: 540 });
    expect(scaleByPercent(1000, 500, 200)).toEqual({ width: 2000, height: 1000 });
  });

  it("never returns less than 1 pixel", () => {
    expect(scaleByPercent(10, 10, 1)).toEqual({ width: 1, height: 1 });
    expect(scaleByPercent(10, 10, "")).toEqual({ width: 1, height: 1 });
  });
});
