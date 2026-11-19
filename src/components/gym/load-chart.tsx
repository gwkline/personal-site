import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

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
import { SectionHeader } from "@/components/ui/section-header";
import { formatShortDate } from "@/lib/gym/format";
import { weeklyLoad } from "@/lib/gym/metrics";
import type { GymSession } from "@/lib/gym/types";

const WEEKS = 8;

export const LoadChart = ({
  sessions,
  todayIso,
}: {
  sessions: GymSession[];
  todayIso: string;
}) => {
  const weeks = weeklyLoad(sessions, todayIso, WEEKS);
  const data = weeks.map((week) => ({
    km: week.runKm,
    label: formatShortDate(week.weekStart),
    volume: week.liftVolumeKg,
  }));
  const bestVolume = Math.max(...data.map((point) => point.volume), 1);
  const bestKm = Math.max(...data.map((point) => point.km), 1);

  return (
    <section aria-labelledby="gym-load-title" className="space-y-5">
      <SectionHeader
        description="Weekly lift volume (sets × kg, bars) against run distance (km, line)."
        eyebrow="By the numbers"
        id="gym-load-title"
        title="Training load"
      />
      <Card elevated>
        <CardHeader>
          <CardTitle variant="section">Last {WEEKS} weeks</CardTitle>
          <CardDescription>
            Hard weeks ride both lines up; a deload should show here too.
          </CardDescription>
          <CardAction>
            <span className="rounded-lg bg-muted px-2.5 py-1.5 font-mono text-muted-foreground text-xs tabular-nums">
              {Math.round(bestVolume).toLocaleString()} kg / {bestKm.toFixed(0)}{" "}
              km peaks
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3" grow>
          {/* Explicit height makes the percentage chain definite; a plain
              block card leaves heights auto and recharts measures zero. */}
          <div className="h-72">
            <ChartContainer
              config={{
                km: {
                  color: "var(--info)",
                  label: "Run km",
                },
                volume: {
                  color: "var(--primary)",
                  label: "Lift volume (kg)",
                },
              }}
              initialDimension={{ height: 280, width: 360 }}
              size="fill"
            >
              <ComposedChart
                accessibilityLayer
                data={data}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  padding={{ left: 16, right: 8 }}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  width={40}
                  yAxisId="volume"
                />
                <YAxis axisLine={false} hide orientation="right" yAxisId="km" />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dashed" />}
                  cursor={false}
                />
                <Bar
                  dataKey="volume"
                  fill="var(--color-volume)"
                  radius={[4, 4, 0, 0]}
                  yAxisId="volume"
                />
                <Line
                  dataKey="km"
                  dot={{ fill: "var(--color-km)", r: 3, strokeWidth: 0 }}
                  stroke="var(--color-km)"
                  strokeWidth={2}
                  type="monotone"
                  yAxisId="km"
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
