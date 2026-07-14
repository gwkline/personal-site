import { cva } from "class-variance-authority";
import { Camera, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import type { ChallengeDay } from "@/lib/hard75";
import { formatChallengeDate, REQUIREMENT_COUNT } from "@/lib/hard75";
import { cn } from "@/lib/utils";

const trackerDayVariants = cva(
  "group relative aspect-square min-h-11 overflow-hidden rounded-lg border font-mono text-xs tabular-nums transition-[transform,box-shadow,border-color] duration-150 ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background enabled:hover:-translate-y-0.5 enabled:hover:shadow-md enabled:active:scale-95 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0",
  {
    variants: {
      status: {
        complete:
          "border-success/50 bg-success text-white dark:text-background",
        future: "border-border/60 bg-muted/25 text-muted-foreground/50",
        high: "border-chart-4/50 bg-chart-4/80 text-foreground",
        partial: "border-chart-4/30 bg-chart-4/25 text-foreground",
        unlogged: "border-border bg-card/80 text-muted-foreground",
      },
    },
  }
);

const getDayStatus = (day: ChallengeDay) => {
  if (day.isFuture) {
    return "future" as const;
  }
  if (day.isComplete) {
    return "complete" as const;
  }
  if (day.completedCount >= 5) {
    return "high" as const;
  }
  if (day.completedCount >= 1) {
    return "partial" as const;
  }
  return "unlogged" as const;
};

const getStatusLabel = (day: ChallengeDay) => {
  if (day.isFuture) {
    return "Upcoming";
  }
  if (day.isComplete) {
    return "Perfect day";
  }
  if (day.completedCount > 0) {
    return `${day.completedCount} of ${REQUIREMENT_COUNT} complete`;
  }
  return "Not logged";
};

export const TrackerGrid = ({
  days,
  onSelectDay,
  selectedDay,
}: {
  days: ChallengeDay[];
  onSelectDay: (day: ChallengeDay) => void;
  selectedDay?: number;
}) => (
  <section aria-labelledby="grid-title" className="space-y-5">
    <SectionHeader
      action={
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">
            <span className="size-2 rounded-sm bg-current" />
            Complete
          </Badge>
          <Badge variant="outline">
            <span className="size-2 rounded-sm bg-chart-4" />
            In progress
          </Badge>
          <Badge variant="outline">
            <span className="size-2 rounded-sm border bg-muted" />
            Unlogged
          </Badge>
        </div>
      }
      description="Select a day to view its details."
      id="grid-title"
      title="Daily log"
    />

    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 md:grid-cols-[repeat(15,minmax(0,1fr))]">
      {days.map((day) => (
        <button
          aria-label={`Day ${day.dayIndex}, ${formatChallengeDate(day.date, {
            day: "numeric",
            month: "long",
          })}: ${getStatusLabel(day)}`}
          className={cn(
            trackerDayVariants({ status: getDayStatus(day) }),
            day.isToday &&
              "ring-2 ring-primary/80 ring-offset-2 ring-offset-background",
            selectedDay === day.dayIndex &&
              "z-10 shadow-elevation-2 ring-2 ring-primary"
          )}
          disabled={day.isFuture}
          key={day.dayIndex}
          onClick={() => onSelectDay(day)}
          title={`Day ${day.dayIndex} · ${getStatusLabel(day)}`}
          type="button"
        >
          <span className="absolute top-1.5 left-1.5">{day.dayIndex}</span>
          {day.isComplete ? (
            <Check className="absolute right-1.5 bottom-1.5 size-3.5 opacity-80" />
          ) : (
            <span className="absolute right-1.5 bottom-1.5 text-[9px] opacity-70">
              {day.isFuture
                ? "—"
                : `${day.completedCount}/${REQUIREMENT_COUNT}`}
            </span>
          )}
          {day.publicPhotoUrl || day.progressPhotoUrl ? (
            <Camera className="absolute top-1.5 right-1.5 size-2.5 opacity-70" />
          ) : null}
        </button>
      ))}
    </div>
  </section>
);
