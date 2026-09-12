import { describe, expect, it } from "vitest";
import { buildCronExpression, describeCronExpression, validateCronExpression } from "./cronHelper.utils.js";

describe("buildCronExpression", () => {
  it("defaults empty fields to *", () => {
    expect(buildCronExpression({ minute: "", hour: "9", dayOfMonth: "", month: "", dayOfWeek: "1-5" })).toBe(
      "* 9 * * 1-5",
    );
  });
});

describe("validateCronExpression", () => {
  it("accepts a valid 5-field expression", () => {
    expect(validateCronExpression("0 9 * * 1-5").valid).toBe(true);
  });

  it("rejects expressions without exactly 5 fields", () => {
    expect(validateCronExpression("* * * *").valid).toBe(false);
  });

  it("rejects out-of-range field values", () => {
    expect(validateCronExpression("60 * * * *").valid).toBe(false);
    expect(validateCronExpression("* * * * 8").valid).toBe(false);
  });

  it("rejects non-numeric fields", () => {
    expect(validateCronExpression("a b c d e").valid).toBe(false);
  });
});

describe("describeCronExpression", () => {
  it.each([
    ["* * * * *", "Runs every minute."],
    ["0 0 * * *", "Runs at 00:00, every day."],
    ["0 9 * * 1-5", "Runs at 09:00, on weekdays."],
    ["0 9 * * 1", "Runs at 09:00, on Monday."],
    ["0 0 1 * *", "Runs at 00:00, on day 1 of the month."],
  ])("describes %s as %s", (expression, expected) => {
    const result = describeCronExpression(expression);
    expect(result.success).toBe(true);
    expect(result.description).toBe(expected);
  });

  it("returns an error for an invalid expression", () => {
    expect(describeCronExpression("not a cron").success).toBe(false);
  });
});
