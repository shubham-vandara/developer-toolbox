import { describe, expect, it } from "vitest";
import { planPageNumbers } from "./pdfPageNumberer.utils.js";

describe("planPageNumbers", () => {
  it("numbers every page from 1 by default", () => {
    const { plan, total } = planPageNumbers({ pages: [1, 2, 3] });
    expect(plan).toEqual([{ page: 1, number: 1 }, { page: 2, number: 2 }, { page: 3, number: 3 }]);
    expect(total).toBe(3);
  });

  it("skips pages before the start page and uses a custom first number", () => {
    const { plan, total } = planPageNumbers({ pages: [1, 2, 3, 4, 5], startPage: 3, startNumber: 1 });
    expect(plan).toEqual([{ page: 3, number: 1 }, { page: 4, number: 2 }, { page: 5, number: 3 }]);
    expect(total).toBe(3);
  });

  it("numbers only the selected pages, consecutively", () => {
    const { plan } = planPageNumbers({ pages: [2, 4, 6], startNumber: 10 });
    expect(plan.map((p) => p.number)).toEqual([10, 11, 12]);
  });

  it("handles an empty selection", () => {
    expect(planPageNumbers({ pages: [5], startPage: 9 })).toEqual({ plan: [], total: 0 });
  });
});
