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
  <div className="absolute top-3 left-3 z-10">
    <div className="space-y-3 rounded-lg bg-background/85 p-3 ring-1 ring-foreground/10 backdrop-blur-sm">
      <span className="flex items-center gap-2 text-muted-foreground text-xs">
        <CalendarDays className="size-4 text-chart-2" />
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
    <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-muted-foreground text-xs ring-1 ring-foreground/10 backdrop-blur-sm">
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
    <Card className="overflow-hidden" variant="muted">
      <CardHeader>
        <div className="max-w-3xl space-y-3">
          <CardTitle variant="display">The Long Game</CardTitle>
          <CardDescription className="max-w-2xl" size="lg">
            Seventy-five days of training, discipline, and showing up before the
            wedding and the marathon.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative min-h-72">
          <JourneySummary />
          <MarathonCourseGraphic
            className="h-full"
            days={days}
            equivalentDays={equivalentDays}
            onSelectDay={onSelectDay}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-1 md:content-start">
          <Stat
            detail="entries"
            icon={<CalendarCheck className="size-3.5 text-chart-2" />}
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
