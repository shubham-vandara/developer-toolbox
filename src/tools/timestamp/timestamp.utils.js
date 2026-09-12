export function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function parseTimestamp(rawValue, unit) {
  const trimmed = String(rawValue).trim();
  if (trimmed === "") {
    return { success: false, error: "Enter a numeric timestamp." };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return { success: false, error: "Enter a valid numeric timestamp." };
  }
  const ms = unit === "seconds" ? num * 1000 : num;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return { success: false, error: "That timestamp is out of the supported range." };
  }
  return { success: true, date };
}

export function parseDateInput(rawValue) {
  const trimmed = String(rawValue).trim();
  if (trimmed === "") {
    return { success: false, error: "Enter a date." };
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return {
      success: false,
      error: "Enter a valid date, e.g. 2024-01-01T12:00:00 or 2024-01-01.",
    };
  }
  return { success: true, date };
}

export function formatLocal(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

export function formatUTC(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function toUnixSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

export function toUnixMilliseconds(date) {
  return date.getTime();
}
