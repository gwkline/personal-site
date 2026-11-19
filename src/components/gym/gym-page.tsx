import { useMutation, useQuery } from "convex/react";
import { DatabaseZap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDayOfWeek, getTodayIso } from "@/lib/gym/format";
import type { PlanDay, SessionKind } from "@/lib/gym/types";

import { api } from "../../../convex/_generated/api";
import { CoachPanel } from "./coach-panel";
import { GoalPanel } from "./goal-panel";
import { LoadChart } from "./load-chart";
import { PlanBoard } from "./plan-board";
import type { DraftEntry } from "./session-logger";
import { SessionLogger } from "./session-logger";
import { TodayHero } from "./today-hero";

const kindForLog = (day: PlanDay | null): SessionKind => {
  if (day?.kind === "lift") {
    return "lift";
  }
  if (day?.kind === "run") {
    return "run";
  }
  return "cross-train";
};

/** Build the logSession mutation args from the logger dialog payload. */
const buildLogArgs = (
  payload: {
    entries: DraftEntry[];
    notes: string;
    rpe: number | null;
    skipped: boolean;
    title: string;
  },
  args: {
    kind: SessionKind;
    planVersion: number | null;
    todayIso: string;
  }
) => ({
  date: args.todayIso,
  entries: payload.entries.map((entry) => ({
    distanceKm: entry.distanceKm,
    durationMin: entry.durationMin,
    name: entry.name,
    notes: entry.notes,
    sets: entry.sets,
  })),
  kind: args.kind,
  notes: payload.notes === "" ? undefined : payload.notes,
  planVersion: args.planVersion ?? undefined,
  rpe: payload.rpe ?? undefined,
  skipped: payload.skipped ? true : undefined,
  title: payload.title,
});

const DEFAULT_TIMEZONE = "America/New_York";

type GymQueryResult = NonNullable<
  ReturnType<typeof useQuery<typeof api.gym.get>>
>;

interface Dashboard {
  goals: GymQueryResult["goals"];
  isOwner: boolean;
  nudgeEnabled: boolean;
  planDays: PlanDay[];
  planName: string | null;
  planVersion: number | null;
  sessions: GymQueryResult["sessions"];
  timezone: string;
}

/** Apply loading defaults once, off the component, so GymPage stays simple. */
const parseDashboard = (
  result: ReturnType<typeof useQuery<typeof api.gym.get>>
): Dashboard => ({
  goals: result?.goals ?? [],
  isOwner: result?.isOwner ?? false,
  nudgeEnabled: result?.settings.nudgeEnabled ?? false,
  planDays: result?.plan?.days ?? [],
  planName: result?.plan?.name ?? null,
  planVersion: result?.plan?.version ?? null,
  sessions: result?.sessions ?? [],
  timezone: result?.settings.timezone ?? DEFAULT_TIMEZONE,
});

const SeedCard = ({
  busy,
  error,
  onSeed,
}: {
  busy: boolean;
  error: string | null;
  onSeed: () => void;
}) => (
  <Card elevated>
    <CardHeader>
      <CardTitle variant="section">Start from a balanced template</CardTitle>
      <CardDescription size="lg">
        Seeds a run/lift-balance starter plan, three weeks of demo history, and
        three goals — so every surface has something real on it. Each part only
        seeds if it&apos;s empty.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button disabled={busy} onClick={onSeed}>
        <DatabaseZap aria-hidden="true" className="size-4" />
        {busy ? "Seeding…" : "Load demo data"}
      </Button>
      {error ? (
        <p
          aria-live="polite"
          className="mt-2 text-destructive text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </CardContent>
  </Card>
);

export const GymPage = () => {
  const result = useQuery(api.gym.get);
  const logSession = useMutation(api.gym.logSession);
  const upsertPlanDay = useMutation(api.gym.upsertPlanDay);
  const upsertGoal = useMutation(api.gym.upsertGoal);
  const retireGoal = useMutation(api.gym.retireGoal);
  const setNudge = useMutation(api.gym.setNudge);
  const seedDemoData = useMutation(api.gym.seedDemoData);

  const dashboard = parseDashboard(result);
  const {
    isOwner,
    planDays,
    planName,
    planVersion,
    sessions,
    goals,
    timezone,
    nudgeEnabled,
  } = dashboard;
  const todayIso = getTodayIso(timezone);
  const todayPlanDay: PlanDay | null =
    planDays.find((day) => day.dayOfWeek === getDayOfWeek(todayIso)) ?? null;
  const isEmpty = planDays.length === 0 && sessions.length === 0;

  const [logging, setLogging] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [addingGoal, setAddingGoal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setActionError(null);
    try {
      await fn();
      return true;
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Something failed"
      );
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-16 pb-6 sm:space-y-20">
      <TodayHero
        isOwner={isOwner}
        onLogToday={() => setLogging(true)}
        planDays={planDays.length > 0 ? planDays : null}
        sessions={sessions}
        todayIso={todayIso}
      />

      {isOwner && isEmpty ? (
        <SeedCard
          busy={busy === "seed"}
          error={actionError}
          onSeed={() =>
            run("seed", async () => {
              await seedDemoData({});
            })
          }
        />
      ) : null}

      <PlanBoard
        editing={editingDay}
        isOwner={isOwner}
        onEditClose={() => setEditingDay(null)}
        onEditOpen={setEditingDay}
        onSaveDay={(day) => {
          void run("plan-day", async () => {
            await upsertPlanDay({ day });
            setEditingDay(null);
          });
        }}
        planDays={planDays}
        planName={planName}
        planVersion={planVersion}
        saveError={actionError}
        saving={busy === "plan-day"}
      />

      <LoadChart sessions={sessions} todayIso={todayIso} />

      <GoalPanel
        addOpen={addingGoal}
        error={actionError}
        goals={goals}
        isOwner={isOwner}
        onAddClose={() => setAddingGoal(false)}
        onAddOpen={() => setAddingGoal(true)}
        onAddSave={(payload) => {
          void run("goal", async () => {
            await upsertGoal({
              deadline: payload.deadline ?? undefined,
              metric: payload.metric,
              targetValue: payload.targetValue,
              title: payload.title,
              unit: payload.unit,
            });
            setAddingGoal(false);
          });
        }}
        onRetire={(goalId) => {
          void run(`retire-${goalId}`, async () => {
            await retireGoal({ goalId });
          });
        }}
        savingGoal={busy === "goal"}
        sessions={sessions}
        todayIso={todayIso}
      />

      {isOwner ? (
        <CoachPanel
          nudgeEnabled={nudgeEnabled}
          onToggleNudge={async (enabled) => {
            await setNudge({ enabled });
          }}
          planVersion={planVersion}
        />
      ) : null}

      {logging ? (
        <SessionLogger
          error={actionError}
          onClose={() => setLogging(false)}
          onSave={(payload) => {
            void run("log", async () => {
              await logSession(
                buildLogArgs(payload, {
                  kind: kindForLog(todayPlanDay),
                  planVersion,
                  todayIso,
                })
              );
              setLogging(false);
            });
          }}
          planDay={todayPlanDay}
          saving={busy === "log"}
          todayIso={todayIso}
        />
      ) : null}
    </div>
  );
};
