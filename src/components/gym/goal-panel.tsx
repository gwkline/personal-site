import { Plus, Target, Trophy, X } from "lucide-react";
import { useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { goalProgress } from "@/lib/gym/metrics";
import type { GymGoal, GymSession } from "@/lib/gym/types";

import type { Id } from "../../../convex/_generated/dataModel";

const METRICS = [
  {
    hint: "Best estimated 1RM across logged sets. Metric: lift-e1rm:<exercise>.",
    label: "Lift e1RM",
    metric: "lift-e1rm",
    unit: "kg",
  },
  {
    hint: "Total run kilometers in the last 7 days.",
    label: "Weekly run km",
    metric: "weekly-run-km",
    unit: "km",
  },
  {
    hint: "Sessions logged in the last 7 days.",
    label: "Weekly sessions",
    metric: "weekly-sessions",
    unit: "sessions",
  },
] as const;

const AddGoalForm = ({
  error,
  onSave,
  saving,
}: {
  error: string | null;
  onSave: (payload: {
    deadline: string | null;
    metric: string;
    targetValue: number;
    title: string;
    unit: string;
  }) => void;
  saving: boolean;
}) => {
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<string>(METRICS[0].metric);
  const [exercise, setExercise] = useState("Back Squat");
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");

  const selected = METRICS.find((candidate) => candidate.metric === metric);
  const finalMetric =
    metric === "lift-e1rm" ? `lift-e1rm:${exercise.trim()}` : metric;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <Label className="font-normal" htmlFor="gym-goal-title">
          Title
        </Label>
        <Input
          id="gym-goal-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Back squat 140 kg × 3"
          value={title}
        />
      </div>

      <div className="grid gap-1">
        <span className="font-medium text-sm">Metric</span>
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {METRICS.map((candidate) => (
            <Button
              aria-pressed={candidate.metric === metric}
              key={candidate.metric}
              onClick={() => setMetric(candidate.metric)}
              size="xs"
              variant={candidate.metric === metric ? "secondary" : "ghost"}
            >
              {candidate.label}
            </Button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{selected?.hint}</p>
      </div>

      {metric === "lift-e1rm" ? (
        <div className="grid gap-1">
          <Label className="font-normal" htmlFor="gym-goal-exercise">
            Exercise
          </Label>
          <Input
            id="gym-goal-exercise"
            onChange={(event) => setExercise(event.target.value)}
            value={exercise}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label className="font-normal" htmlFor="gym-goal-target">
            Target ({selected?.unit})
          </Label>
          <Input
            id="gym-goal-target"
            inputMode="decimal"
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setTargetValue(
                event.target.value !== "" && Number.isFinite(parsed)
                  ? parsed
                  : null
              );
            }}
            type="number"
            value={targetValue ?? ""}
          />
        </div>
        <div className="grid gap-1">
          <Label className="font-normal" htmlFor="gym-goal-deadline">
            Deadline (optional)
          </Label>
          <Input
            id="gym-goal-deadline"
            onChange={(event) => setDeadline(event.target.value)}
            placeholder="YYYY-MM-DD"
            type="date"
            value={deadline}
          />
        </div>
      </div>

      {error ? (
        <p aria-live="polite" className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          disabled={saving || title.trim() === "" || targetValue === null}
          onClick={() =>
            onSave({
              deadline: deadline === "" ? null : deadline,
              metric: finalMetric,
              targetValue: targetValue ?? 0,
              title: title.trim(),
              unit: selected?.unit ?? "value",
            })
          }
        >
          {saving ? "Saving…" : "Save goal"}
        </Button>
      </DialogFooter>
    </div>
  );
};

export const GoalPanel = ({
  addOpen,
  error,
  goals,
  isOwner,
  onAddClose,
  onAddOpen,
  onAddSave,
  onRetire,
  savingGoal,
  sessions,
  todayIso,
}: {
  addOpen: boolean;
  error: string | null;
  goals: GymGoal[];
  isOwner: boolean;
  onAddClose: () => void;
  onAddOpen: () => void;
  onAddSave: (payload: {
    deadline: string | null;
    metric: string;
    targetValue: number;
    title: string;
    unit: string;
  }) => void;
  onRetire: (goalId: Id<"gymGoals">) => void;
  savingGoal: boolean;
  sessions: GymSession[];
  todayIso: string;
}) => {
  const active = goals.filter((goal) => goal.status !== "retired");

  return (
    <section aria-labelledby="gym-goals-title" className="space-y-5">
      <SectionHeader
        action={
          isOwner ? (
            <Button onClick={onAddOpen} variant="outline">
              <Plus aria-hidden="true" className="size-4" />
              Add goal
            </Button>
          ) : null
        }
        description="Computed live from the session log — nothing is hand-entered."
        eyebrow="Targets"
        id="gym-goals-title"
        title="Goals"
      />

      {active.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No goals yet.{" "}
            {isOwner ? "Add one to start tracking against it." : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((goal) => {
            const progress = goalProgress(goal, sessions, todayIso);
            return (
              <Card className="flex flex-col" key={goal._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {progress.achieved ? (
                      <Trophy
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                    ) : (
                      <Target
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                    )}
                    {goal.title}
                  </CardTitle>
                  <CardDescription>
                    {goal.deadline ? `by ${goal.deadline}` : "open-ended"}
                  </CardDescription>
                  {isOwner ? (
                    <CardAction>
                      <Button
                        aria-label={`Retire goal ${goal.title}`}
                        onClick={() => onRetire(goal._id)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </CardAction>
                  ) : null}
                </CardHeader>
                <CardContent className="mt-auto space-y-2">
                  <Progress value={progress.fraction * 100}>
                    <ProgressLabel className="text-xs">
                      <span className="font-mono">
                        {progress.currentValue.toLocaleString()} /{" "}
                        {goal.targetValue.toLocaleString()} {goal.unit}
                      </span>
                    </ProgressLabel>
                    <ProgressValue />
                  </Progress>
                  {goal.deadline ? (
                    <Badge
                      variant={
                        progress.pace === "behind" ? "destructive" : "secondary"
                      }
                    >
                      {progress.pace === "behind" ? "behind pace" : "on pace"}
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            onAddClose();
          }
        }}
        open={addOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New goal</DialogTitle>
            <DialogDescription>
              Progress is read from the session log — no manual updates.
            </DialogDescription>
          </DialogHeader>
          <AddGoalForm error={error} onSave={onAddSave} saving={savingGoal} />
        </DialogContent>
      </Dialog>
    </section>
  );
};
