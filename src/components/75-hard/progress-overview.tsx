import {
  Activity,
  BookOpen,
  Camera,
  Dumbbell,
  Footprints,
  GlassWater,
  Salad,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
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
import { Stat } from "@/components/ui/stat";
import type { ChallengeDay } from "@/lib/hard75";
import { getChallengeStats, getWeeklyMileage } from "@/lib/hard75";

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
  const stats = getChallengeStats(days);
  const weeklyMileage = getWeeklyMileage(days);
  return (
    <section aria-labelledby="progress-title" className="space-y-5">
      <SectionHeader
        description="A live view of weekly mileage and consistency across every daily requirement."
        eyebrow="By the numbers"
        id="progress-title"
        title="Progress"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="feature">
          <CardHeader>
            <CardAction>
              <Stat
                detail="miles"
                label="Total"
                value={stats.totalMiles.toFixed(1)}
                variant="panel"
              />
            </CardAction>
            <CardTitle variant="section">Mileage</CardTitle>
          </CardHeader>
          <CardContent grow>
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
                data={weeklyMileage}
                margin={{ left: 4, right: 4, top: 8 }}
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
                  dataKey="week"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis hide domain={[0, "auto"]} />
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel />}
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

        <Card variant="muted">
          <CardHeader>
            <CardAction>
              <Stat
                label="Checks"
                value={stats.completedRequirements}
                variant="surface"
              />
            </CardAction>
            <CardTitle variant="section">Requirements</CardTitle>
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
