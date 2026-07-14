import {
  CalendarCheck,
  CalendarDays,
  Flag,
  Flame,
  Footprints,
  Heart,
  MousePointer2,
} from "lucide-react";

import { MarathonCourseGraphic } from "@/components/75-hard/marathon-course";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import type { ChallengeDay } from "@/lib/hard75";

const JourneySummary = () => (
  <div className="relative z-10 mb-3 sm:absolute sm:top-3 sm:left-3 sm:mb-0">
    <div className="grid gap-2 rounded-lg bg-card/90 p-3 shadow-elevation-1 ring-1 ring-foreground/10 backdrop-blur-xl sm:gap-3">
      <span className="flex items-center gap-2 text-muted-foreground text-xs">
        <CalendarDays className="size-4 text-primary" />
        Challenge start · Jul 13
      </span>
      <span className="flex items-center gap-2 text-muted-foreground text-xs">
        <Heart className="size-4 text-chart-4" />
        Wedding · October
      </span>
      <span className="flex items-center gap-2 text-muted-foreground text-xs">
        <Flag className="size-4 text-chart-1" />
        NYC Marathon · November
      </span>
    </div>
    <span className="mt-2 hidden items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-muted-foreground text-xs shadow-elevation-1 ring-1 ring-foreground/10 backdrop-blur-xl sm:inline-flex">
      <MousePointer2 className="size-4" />
      Select a day on the route
    </span>
  </div>
);

export const ChallengeHero = ({
  days,
  equivalentDays,
  onSelectDay,
  streak,
  totalMiles,
}: {
  days: ChallengeDay[];
  equivalentDays: number;
  onSelectDay: (day: ChallengeDay) => void;
  streak: number;
  totalMiles: number;
}) => {
  const daysLogged = days.filter(
    (day) =>
      !day.isFuture &&
      (day.updatedAt > 0 ||
        day.completedCount > 0 ||
        Boolean(day.note) ||
        Boolean(day.progressPhotoUrl) ||
        Boolean(day.publicPhotoUrl) ||
        Boolean(day.runMiles))
  ).length;

  return (
    <Card
      className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_42%),var(--card)]"
      variant="feature"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader>
        <div className="max-w-3xl space-y-3">
          <CardTitle variant="display">
            The <span className="text-primary">Long Game</span>
          </CardTitle>
          <CardDescription className="max-w-2xl" size="lg">
            Seventy-five days of training, discipline, and showing up before the
            wedding and the marathon.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative overflow-hidden rounded-xl border bg-surface-sunken p-3 sm:min-h-80 sm:p-0">
          <JourneySummary />
          <MarathonCourseGraphic
            className="h-auto min-h-56 sm:h-full"
            days={days}
            equivalentDays={equivalentDays}
            onSelectDay={onSelectDay}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-1 md:content-start">
          <Stat
            detail="entries"
            icon={<CalendarCheck className="size-3.5 text-primary" />}
            label="Days logged"
            value={daysLogged}
            variant="surface"
          />
          <Stat
            detail="perfect days in a row"
            icon={<Flame className="size-3.5 text-chart-4" />}
            label="Streak"
            value={streak}
            variant="surface"
          />
          <Stat
            detail="running"
            icon={<Footprints className="size-3.5 text-chart-1" />}
            label="Miles"
            value={totalMiles.toFixed(1)}
            variant="surface"
          />
        </div>
      </CardContent>
    </Card>
  );
};
