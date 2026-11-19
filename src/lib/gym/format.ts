/** Timezone-aware date helpers for the gym tracker. All dates are "YYYY-MM-DD". */

const NY_TZ = "America/New_York";

export const getTodayIso = (
  timezone: string = NY_TZ,
  now: Date = new Date()
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
};

/** Day of week where 0 = Monday … 6 = Sunday. */
export const getDayOfWeek = (isoDate: string) => {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  // getUTCDay: 0 = Sunday. Shift so Monday = 0.
  return (date.getUTCDay() + 6) % 7;
};

export const addDaysIso = (isoDate: string, amount: number) => {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

/** Monday of the week containing isoDate. */
export const getWeekStartIso = (isoDate: string) =>
  addDaysIso(isoDate, -getDayOfWeek(isoDate));

export const diffDays = (fromIso: string, toIso: string) => {
  const from = new Date(`${fromIso}T12:00:00.000Z`).getTime();
  const to = new Date(`${toIso}T12:00:00.000Z`).getTime();
  return Math.round((to - from) / 86_400_000);
};

const WEEK_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

export const formatShortDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...WEEK_LABEL_FORMAT,
  }).format(new Date(`${isoDate}T12:00:00.000Z`));

export const formatLongDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    ...WEEK_LABEL_FORMAT,
  }).format(new Date(`${isoDate}T12:00:00.000Z`));
