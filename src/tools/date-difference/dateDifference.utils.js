export function calculateDateDifference(startStr, endStr) {
  if (!startStr || !endStr) {
    return { success: false, error: "Enter both a start and end date." };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (Number.isNaN(start.getTime())) return { success: false, error: "The start date is invalid." };
  if (Number.isNaN(end.getTime())) return { success: false, error: "The end date is invalid." };

  const reversed = start > end;
  const [from, to] = reversed ? [end, start] : [start, end];

  const totalMs = to.getTime() - from.getTime();
  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { success: true, reversed, years, months, days, totalDays, totalHours, totalMinutes };
}
