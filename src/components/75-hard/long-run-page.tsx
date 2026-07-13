import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { ChallengeHero } from "@/components/75-hard/challenge-hero";
import { DayDetail } from "@/components/75-hard/day-detail";
import { ProgressOverview } from "@/components/75-hard/progress-overview";
import { TrackerGrid } from "@/components/75-hard/tracker-grid";
import {
  buildChallengeDays,
  DEFAULT_CHALLENGE,
  formatChallengeDate,
  getChallengeStats,
  REQUIREMENT_COUNT,
} from "@/lib/hard75";

import { api } from "../../../convex/_generated/api";

export const LongRunPage = () => {
  const result = useQuery(api.hard75.get);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const challenge = result?.challenge ?? DEFAULT_CHALLENGE;
  const progress = result?.days;

  const days = useMemo(
    () => buildChallengeDays(challenge, progress ?? []),
    [challenge, progress]
  );

  const stats = getChallengeStats(days);
  const equivalentDays = stats.completedRequirements / REQUIREMENT_COUNT;
  const selectedDay =
    days.find((day) => day.dayIndex === selectedDayIndex) ?? null;

  return (
    <div className="space-y-10">
      <ChallengeHero
        days={days}
        equivalentDays={equivalentDays}
        onSelectDay={(day) => setSelectedDayIndex(day.dayIndex)}
        streak={stats.streak}
        totalMiles={stats.totalMiles}
      />

      <TrackerGrid
        days={days}
        onSelectDay={(day) => setSelectedDayIndex(day.dayIndex)}
        selectedDay={selectedDayIndex ?? undefined}
      />

      <ProgressOverview days={days} />

      <footer className="flex flex-col justify-between gap-2 border-t pt-6 text-muted-foreground text-xs sm:flex-row">
        <p>Missed requirements remain in the record.</p>
        <p>
          Ends{" "}
          {formatChallengeDate(challenge.endDate, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </footer>

      <DayDetail
        day={selectedDay}
        isOwner={result?.isOwner ?? false}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDayIndex(null);
          }
        }}
        open={selectedDay !== null}
      />
    </div>
  );
};
