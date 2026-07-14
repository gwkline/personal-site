export const REQUIREMENTS = [
  {
    key: "diet",
    label: "Follow the diet — no alcohol, no cheat meals",
    shortLabel: "Diet",
  },
  {
    key: "workoutOne",
    label: "First 45-minute workout",
    shortLabel: "Workout 1",
  },
  {
    key: "workoutTwo",
    label: "Second 45-minute workout",
    shortLabel: "Workout 2",
  },
  {
    key: "outdoors",
    label: "At least one workout outside",
    shortLabel: "Outside",
  },
  { key: "water", label: "Drink one gallon of water", shortLabel: "Water" },
  {
    key: "reading",
    label: "Read 10 pages of non-fiction",
    shortLabel: "Reading",
  },
  {
    key: "progressPhoto",
    label: "Take a progress photo",
    shortLabel: "Photo",
  },
] as const;

export const REQUIREMENT_COUNT = REQUIREMENTS.length;

export const DEFAULT_CHALLENGE: ChallengeConfig = {
  endDate: "2026-09-25",
  slug: "the-long-run-2026",
  startDate: "2026-07-13",
  timezone: "America/New_York",
  title: "The Long Game",
  totalDays: 75,
};

export type RequirementKey = (typeof REQUIREMENTS)[number]["key"];

export interface DailyProgress {
  date: string;
  dayIndex: number;
  diet: boolean;
  note?: string;
  outdoors: boolean;
  progressPhoto: boolean;
  progressPhotoUrl: string | null;
  publicPhotoUrl: string | null;
  reading: boolean;
  runMiles?: number;
  updatedAt: number;
  water: boolean;
  workoutOne: boolean;
  workoutTwo: boolean;
}

export interface ChallengeConfig {
  endDate: string;
  slug: string;
  startDate: string;
  timezone: string;
  title: string;
  totalDays: number;
}

export interface ChallengeDay extends DailyProgress {
  completedCount: number;
  isComplete: boolean;
  isFuture: boolean;
  isToday: boolean;
}

const addDays = (isoDate: string, amount: number) => {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

export const getTodayInTimezone = (
  timezone: string,
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

export const formatChallengeDate = (
  isoDate: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT
) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${isoDate}T12:00:00.000Z`));

export const countCompletedRequirements = (
  day: Pick<DailyProgress, RequirementKey>
) => REQUIREMENTS.filter(({ key }) => day[key]).length;

export const buildChallengeDays = (
  challenge: ChallengeConfig,
  progress: DailyProgress[],
  today = getTodayInTimezone(challenge.timezone)
): ChallengeDay[] => {
  const progressByIndex = new Map(progress.map((day) => [day.dayIndex, day]));
  return Array.from({ length: challenge.totalDays }, (_, index) => {
    const dayIndex = index + 1;
    const date = addDays(challenge.startDate, index);
    const saved = progressByIndex.get(dayIndex);
    const base: DailyProgress = saved ?? {
      date,
      dayIndex,
      diet: false,
      outdoors: false,
      progressPhoto: false,
      progressPhotoUrl: null,
      publicPhotoUrl: null,
      reading: false,
      updatedAt: 0,
      water: false,
      workoutOne: false,
      workoutTwo: false,
    };
    const completedCount = countCompletedRequirements(base);
    return {
      ...base,
      completedCount,
      isComplete: completedCount === REQUIREMENTS.length,
      isFuture: date > today,
      isToday: date === today,
    };
  });
};

export const getChallengeStats = (days: ChallengeDay[]) => {
  const elapsed = days.filter((day) => !day.isFuture);
  const perfectDays = elapsed.filter((day) => day.isComplete).length;
  const completedRequirements = elapsed.reduce(
    (total, day) => total + day.completedCount,
    0
  );
  const possibleRequirements = elapsed.length * REQUIREMENTS.length;
  const consistency =
    possibleRequirements === 0
      ? 0
      : Math.round((completedRequirements / possibleRequirements) * 100);
  const taskRates = REQUIREMENTS.map((requirement) => ({
    ...requirement,
    completed: elapsed.filter((day) => day[requirement.key]).length,
    percentage:
      elapsed.length === 0
        ? 0
        : Math.round(
            (elapsed.filter((day) => day[requirement.key]).length /
              elapsed.length) *
              100
          ),
  }));

  let streak = 0;
  const lastDay = elapsed.at(-1);
  const streakCandidates =
    lastDay?.isToday && !lastDay.isComplete ? elapsed.slice(0, -1) : elapsed;
  for (let index = streakCandidates.length - 1; index >= 0; index -= 1) {
    if (!streakCandidates[index]?.isComplete) {
      break;
    }
    streak += 1;
  }

  return {
    completedRequirements,
    consistency,
    elapsedDays: elapsed.length,
    perfectDays,
    streak,
    taskRates,
    totalMiles: elapsed.reduce((total, day) => total + (day.runMiles ?? 0), 0),
  };
};

export const getWeeklyMileage = (days: ChallengeDay[]) => {
  const weeks = Array.from({ length: 11 }, (_, weekIndex) => {
    const weekDays = days.slice(weekIndex * 7, weekIndex * 7 + 7);
    return {
      miles: Number(
        weekDays
          .reduce((total, day) => total + (day.runMiles ?? 0), 0)
          .toFixed(1)
      ),
      week: `W${weekIndex + 1}`,
    };
  }).filter((week, index) => index === 0 || week.miles > 0);
  return [{ miles: 0, week: "Start" }, ...weeks];
};

export const getDayNumber = (days: ChallengeDay[]) => {
  const today = days.find((day) => day.isToday);
  if (today) {
    return today.dayIndex;
  }
  if (days.every((day) => day.isFuture)) {
    return 0;
  }
  return days.length;
};

export const daysBetween = (fromIso: string, toIso: string) => {
  const from = new Date(`${fromIso}T12:00:00.000Z`).getTime();
  const to = new Date(`${toIso}T12:00:00.000Z`).getTime();
  return Math.max(0, Math.ceil((to - from) / 86_400_000));
};
