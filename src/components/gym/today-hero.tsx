import {
  BadgeCheck,
  CircleDashed,
  Dumbbell,
  Footprints,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import {
  addDaysIso,
  formatLongDate,
  getDayOfWeek,
  getWeekStartIso,
} from "@/lib/gym/format";
import { sessionStreak, weeklyLoad } from "@/lib/gym/metrics";
import { DAY_SHORT_NAMES } from "@/lib/gym/types";
import type { GymSession, PlanDay } from "@/lib/gym/types";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<
  PlanDay["kind"],
  { dot: string; icon: typeof Dumbbell; label: string }
> = {
  "cross-train": {
    dot: "bg-secondary-foreground",
    icon: Sparkles,
    label: "Cross",
  },
  lift: { dot: "bg-primary", icon: Dumbbell, label: "Lift" },
  rest: { dot: "bg-muted-foreground", icon: MoonStar, label: "Rest" },
  run: { dot: "bg-info", icon: Footprints, label: "Run" },
};

const dayStatusText = (
  day: { done: boolean; isToday: boolean },
  style: { label: string } | undefined
) => {
  if (day.done) {
    return "done";
  }
  if (day.isToday) {
    return "today";
  }
  return style?.label.toLowerCase() ?? "";
};

export const KindDot = ({ kind }: { kind: PlanDay["kind"] }) => (
  <span
    aria-hidden="true"
    className={cn(
      "size-1.5 shrink-0 rounded-full",
      KIND_STYLES[kind]?.dot ?? "bg-muted"
    )}
  />
);

export const TodayHero = ({
  isOwner,
  onLogToday,
  planDays,
  sessions,
  todayIso,
}: {
  isOwner: boolean;
  onLogToday: () => void;
  planDays: PlanDay[] | null;
  sessions: GymSession[];
  todayIso: string;
}) => {
  const todayDow = getDayOfWeek(todayIso);
  const planned = planDays?.find((day) => day.dayOfWeek === todayDow) ?? null;
  const loggedDates = useMemo(
    () =>
      new Set(
        sessions
          .filter((session) => !session.skipped)
          .map((session) => session.date)
      ),
    [sessions]
  );
  const loggedToday = loggedDates.has(todayIso);
  const streak = useMemo(
    () => sessionStreak(sessions, todayIso),
    [sessions, todayIso]
  );
  const thisWeek = useMemo(
    () => weeklyLoad(sessions, todayIso, 1)[0],
    [sessions, todayIso]
  );
  const weekStart = getWeekStartIso(todayIso);
  const strip = useMemo(
    () =>
      DAY_SHORT_NAMES.map((name, dow) => {
        const date = addDaysIso(weekStart, dow);
        const day =
          planDays?.find((candidate) => candidate.dayOfWeek === dow) ?? null;
        return {
          date,
          done: loggedDates.has(date),
          isToday: date === todayIso,
          kind: day?.kind ?? ("rest" as const),
          name,
          title: day?.title ?? "—",
        };
      }),
    [planDays, loggedDates, weekStart, todayIso]
  );

  return (
    <section aria-labelledby="gym-today-title" className="space-y-5">
      <Card elevated>
        <CardHeader>
          <CardTitle id="gym-today-title" variant="section">
            Today
          </CardTitle>
          <CardDescription size="lg">
            {formatLongDate(todayIso)}
          </CardDescription>
          <CardAction>
            {loggedToday ? (
              <Badge variant="secondary">
                <BadgeCheck aria-hidden="true" className="size-3.5" />
                Logged
              </Badge>
            ) : (
              <Badge variant="outline">
                <CircleDashed aria-hidden="true" className="size-3.5" />
                Open
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-semibold tracking-tight">
                {planned?.title ?? "No session planned"}
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                {planned
                  ? planned.items
                      .map(
                        (item) =>
                          `${item.name}${item.sets ? ` · ${item.sets}×${item.repMin ?? ""}${item.repMax && item.repMax !== item.repMin ? `–${item.repMax}` : ""}` : ""}`
                      )
                      .join("  ·  ") || "Rest day"
                  : "Seed a plan or ask the coach."}
              </p>
            </div>
            {isOwner ? (
              <Button
                onClick={onLogToday}
                variant={loggedToday ? "outline" : "default"}
              >
                {loggedToday ? "Edit today" : "Log today"}
              </Button>
            ) : null}
          </div>

          <ol
            aria-label="This week"
            className="flex list-none flex-wrap gap-1.5"
          >
            {strip.map((day) => {
              const style = KIND_STYLES[day.kind];
              return (
                <div
                  aria-current={day.isToday ? "date" : undefined}
                  className={cn(
                    "flex min-w-15 flex-col gap-1 rounded-lg border px-2 py-1.5",
                    day.isToday && "border-primary/50 bg-primary/8",
                    day.done && "bg-muted"
                  )}
                  key={day.date}
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <KindDot kind={day.kind} />
                    {day.name}
                  </span>
                  <span
                    className={cn(
                      "font-medium text-xs",
                      day.done ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {dayStatusText(day, style)}
                  </span>
                </div>
              );
            })}
          </ol>

          <div className="grid grid-cols-3 gap-3">
            <Stat
              detail={`${thisWeek?.sessions ?? 0} sessions this week`}
              label="Streak"
              value={`${streak}d`}
              variant="panel"
            />
            <Stat
              detail="monotonic sets × kg"
              label="Lift volume"
              value={`${Math.round(thisWeek?.liftVolumeKg ?? 0).toLocaleString()} kg`}
              variant="panel"
            />
            <Stat
              detail="runs, last 7 days"
              label="Run distance"
              value={`${(thisWeek?.runKm ?? 0).toFixed(1)} km`}
              variant="panel"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
