import {
  Activity,
  BookOpen,
  Camera,
  Dumbbell,
  Footprints,
  GlassWater,
  Salad,
} from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import type { ChallengeDay } from "@/lib/hard75";
import {
  getChallengeStats,
  getDailyMileage,
  getWeeklyMileage,
} from "@/lib/hard75";

const TASK_ICONS = {
  diet: Salad,
  outdoors: Footprints,
  progressPhoto: Camera,
  reading: BookOpen,
  water: GlassWater,
  workoutOne: Dumbbell,
  workoutTwo: Activity,
} as const;

export const ProgressOverview = ({ days }: { days: ChallengeDay[] }) => {
  const [mileageView, setMileageView] = useState<"daily" | "weekly">("daily");
  const stats = getChallengeStats(days);
  const weeklyMileage = getWeeklyMileage(days);
  const dailyMileage = getDailyMileage(days);
  const mileageData =
    mileageView === "daily"
      ? dailyMileage.map(({ day, miles }) => ({ label: day, miles }))
      : weeklyMileage.map(({ miles, week }) => ({ label: week, miles }));
  return (
    <section aria-labelledby="progress-title" className="space-y-5">
      <SectionHeader
        description="Mileage and completion rates across every daily requirement."
        eyebrow="By the numbers"
        id="progress-title"
        title="Progress"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="feature">
          <CardHeader>
            <CardAction>
              <fieldset className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                <legend className="sr-only">Mileage chart interval</legend>
                {(["daily", "weekly"] as const).map((view) => (
                  <Button
                    aria-pressed={mileageView === view}
                    className="capitalize"
                    key={view}
                    onClick={() => setMileageView(view)}
                    size="xs"
                    variant={mileageView === view ? "secondary" : "ghost"}
                  >
                    {view}
                  </Button>
                ))}
              </fieldset>
            </CardAction>
            <CardTitle variant="section">Mileage</CardTitle>
            <CardDescription>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {stats.totalMiles.toFixed(1)}
              </span>{" "}
              total miles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3" grow>
            <ChartContainer
              config={{
                miles: {
                  color: "var(--primary)",
                  label: "Miles",
                },
              }}
              initialDimension={{ height: 256, width: 360 }}
              size="fill"
            >
              <AreaChart
                accessibilityLayer
                data={mileageData}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="miles-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-miles)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-miles)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval={mileageView === "daily" ? 6 : 0}
                  padding={{ left: 16, right: 8 }}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis hide domain={[0, "auto"]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                <Area
                  dataKey="miles"
                  dot={{ fill: "var(--color-miles)", r: 3, strokeWidth: 0 }}
                  fill="url(#miles-fill)"
                  stroke="var(--color-miles)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardAction>
              <span className="rounded-lg bg-muted px-2.5 py-1.5 font-mono text-muted-foreground text-xs tabular-nums">
                {stats.completedRequirements} checks
              </span>
            </CardAction>
            <CardTitle variant="section">Requirements</CardTitle>
            <CardDescription>Completion by daily task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.taskRates.map((task) => {
              const Icon = TASK_ICONS[task.key];
              return (
                <Progress key={task.key} value={task.percentage}>
                  <ProgressLabel className="flex items-center gap-2 text-xs">
                    <Icon className="size-3.5 text-muted-foreground" />
                    {task.shortLabel}
                  </ProgressLabel>
                  <ProgressValue className="font-mono text-xs">
                    {() => `${task.completed}/${stats.elapsedDays}`}
                  </ProgressValue>
                </Progress>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
