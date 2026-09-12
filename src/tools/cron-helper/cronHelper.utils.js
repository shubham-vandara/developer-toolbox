export const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day", value: "0 0 * * *" },
  { label: "Every weekday", value: "0 9 * * 1-5" },
  { label: "Every Monday", value: "0 9 * * 1" },
  { label: "Every month", value: "0 0 1 * *" },
];

const FIELD_RANGES = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];
const FIELD_NAMES = ["minute", "hour", "day of month", "month", "day of week"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function buildCronExpression({ minute, hour, dayOfMonth, month, dayOfWeek }) {
  return [minute, hour, dayOfMonth, month, dayOfWeek].map((v) => (v?.trim() ? v.trim() : "*")).join(" ");
}

export function validateCronExpression(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      error: "A cron expression needs exactly 5 fields: minute hour day-of-month month day-of-week.",
    };
  }

  for (let i = 0; i < 5; i += 1) {
    const field = parts[i];
    for (const segment of field.split(",")) {
      const match = segment.match(/^(\*|\d+(?:-\d+)?)(\/\d+)?$/);
      if (!match) {
        return { valid: false, error: `Invalid ${FIELD_NAMES[i]} field: "${segment}".` };
      }
      const base = match[1];
      if (base !== "*") {
        const [start, end] = base.split("-").map(Number);
        const [min, max] = FIELD_RANGES[i];
        if (start < min || start > max || (end !== undefined && (end < min || end > max))) {
          return { valid: false, error: `The ${FIELD_NAMES[i]} field must be between ${min} and ${max}.` };
        }
      }
    }
  }

  return { valid: true };
}

function describeListOrRange(value, names) {
  const label = (n) => (names ? names[Number(n)] : n);
  if (value.includes(",")) return value.split(",").map(label).join(", ");
  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${label(start)} through ${label(end)}`;
  }
  return label(value);
}

export function describeCronExpression(expression) {
  const validation = validateCronExpression(expression);
  if (!validation.valid) return { success: false, error: validation.error };

  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.trim().split(/\s+/);

  if ([minute, hour, dayOfMonth, month, dayOfWeek].every((f) => f === "*")) {
    return { success: true, description: "Runs every minute." };
  }

  let description = "Runs";

  const simpleTime = !/[,/-]/.test(minute) && !/[,/-]/.test(hour) && minute !== "*" && hour !== "*";
  if (simpleTime) {
    description += ` at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  } else if (minute !== "*" && hour === "*") {
    description += ` at minute ${describeListOrRange(minute)} of every hour`;
  } else if (minute.includes("/")) {
    description += ` every ${minute.split("/")[1]} minutes`;
  } else {
    description += ` at minute ${minute === "*" ? "*" : describeListOrRange(minute)}, hour ${hour === "*" ? "*" : describeListOrRange(hour)}`;
  }

  if (dayOfMonth === "*" && dayOfWeek === "*") {
    description += ", every day";
  } else {
    if (dayOfMonth !== "*") {
      description += `, on day ${describeListOrRange(dayOfMonth)} of the month`;
    }
    if (dayOfWeek !== "*") {
      description += dayOfWeek === "1-5" ? ", on weekdays" : `, on ${describeListOrRange(dayOfWeek, DAY_NAMES)}`;
    }
  }

  if (month !== "*") {
    description += `, in ${describeListOrRange(month, [undefined, ...MONTH_NAMES])}`;
  }

  return { success: true, description: `${description}.` };
}
