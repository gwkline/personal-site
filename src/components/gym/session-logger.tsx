import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PlanDay } from "@/lib/gym/types";

interface DraftSet {
  reps: number | null;
  weightKg: number | null;
}

export interface DraftEntry {
  distanceKm: number | null;
  durationMin: number | null;
  name: string;
  notes: string | null;
  sets: DraftSet[];
}

const setsFromPlan = (
  count: number,
  targetWeightKg: number | null
): DraftSet[] =>
  Array.from({ length: Math.max(count, 1) }, () => ({
    reps: null,
    weightKg: targetWeightKg,
  }));

const entriesFromPlanDay = (day: PlanDay | null): DraftEntry[] =>
  (day?.items ?? [])
    .filter((item) => item.name.trim() !== "")
    .map((item) => ({
      distanceKm: item.distanceKm,
      durationMin: item.durationMin,
      name: item.name,
      notes: item.notes,
      sets:
        item.sets === null ? [] : setsFromPlan(item.sets, item.targetWeightKg),
    }));

export const SessionLogger = ({
  error,
  onClose,
  onSave,
  planDay,
  saving,
  todayIso,
}: {
  error: string | null;
  onClose: () => void;
  onSave: (payload: {
    entries: DraftEntry[];
    notes: string;
    rpe: number | null;
    skipped: boolean;
    title: string;
  }) => void;
  planDay: PlanDay | null;
  saving: boolean;
  todayIso: string;
}) => {
  const [title, setTitle] = useState(planDay?.title ?? "Session");
  const [entries, setEntries] = useState<DraftEntry[]>(() =>
    entriesFromPlanDay(planDay)
  );
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [skipped, setSkipped] = useState(false);

  const setEntry = (index: number, patch: Partial<DraftEntry>) =>
    setEntries((current) =>
      current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    );

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log today — {todayIso}</DialogTitle>
          <DialogDescription>
            Weight × reps per set. Blank sets are dropped on save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label className="font-normal" htmlFor="gym-log-title">
              Session title
            </Label>
            <Input
              id="gym-log-title"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </div>

          {entries.length === 0 ? (
            <Button
              onClick={() =>
                setEntries((current) => [
                  ...current,
                  {
                    distanceKm: null,
                    durationMin: null,
                    name: "",
                    notes: null,
                    sets: [{ reps: null, weightKg: null }],
                  },
                ])
              }
              variant="outline"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add exercise
            </Button>
          ) : null}

          {entries.map((entry, index) => (
            <div
              className="grid gap-2 rounded-lg border bg-surface-sunken p-3"
              key={index}
            >
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Exercise name"
                  className="flex-1"
                  onChange={(event) =>
                    setEntry(index, { name: event.target.value })
                  }
                  placeholder="Exercise or run"
                  value={entry.name}
                />
                <Button
                  aria-label={`Remove ${entry.name || "entry"}`}
                  onClick={() =>
                    setEntries((current) => current.toSpliced(index, 1))
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>

              {entry.sets.length === 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    aria-label="Distance in kilometers"
                    inputMode="decimal"
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      setEntry(index, {
                        distanceKm:
                          event.target.value !== "" && Number.isFinite(parsed)
                            ? parsed
                            : null,
                      });
                    }}
                    placeholder="km"
                    type="number"
                    value={entry.distanceKm ?? ""}
                  />
                  <Input
                    aria-label="Duration in minutes"
                    inputMode="decimal"
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      setEntry(index, {
                        durationMin:
                          event.target.value !== "" && Number.isFinite(parsed)
                            ? parsed
                            : null,
                      });
                    }}
                    placeholder="min"
                    type="number"
                    value={entry.durationMin ?? ""}
                  />
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {entry.sets.map((set, setIndex) => (
                    <div
                      className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2"
                      key={setIndex}
                    >
                      <span className="font-mono text-muted-foreground text-xs">
                        {setIndex + 1}
                      </span>
                      <Input
                        aria-label={`Set ${setIndex + 1} weight in kilograms`}
                        inputMode="decimal"
                        onChange={(event) => {
                          const parsed = Number(event.target.value);
                          const weightKg =
                            event.target.value !== "" && Number.isFinite(parsed)
                              ? parsed
                              : null;
                          setEntries((current) =>
                            current.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    sets: row.sets.map((one, si) =>
                                      si === setIndex
                                        ? { ...one, weightKg }
                                        : one
                                    ),
                                  }
                                : row
                            )
                          );
                        }}
                        placeholder="kg"
                        step={1.25}
                        type="number"
                        value={set.weightKg ?? ""}
                      />
                      <Input
                        aria-label={`Set ${setIndex + 1} reps`}
                        inputMode="numeric"
                        onChange={(event) => {
                          const parsed = Number(event.target.value);
                          const reps =
                            event.target.value !== "" && Number.isFinite(parsed)
                              ? parsed
                              : null;
                          setEntries((current) =>
                            current.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    sets: row.sets.map((one, si) =>
                                      si === setIndex ? { ...one, reps } : one
                                    ),
                                  }
                                : row
                            )
                          );
                        }}
                        placeholder="reps"
                        type="number"
                        value={set.reps ?? ""}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      setEntries((current) =>
                        current.map((row, i) =>
                          i === index
                            ? {
                                ...row,
                                sets: [
                                  ...row.sets,
                                  { reps: null, weightKg: null },
                                ],
                              }
                            : entry
                        )
                      )
                    }
                    size="xs"
                    variant="ghost"
                  >
                    <Plus aria-hidden="true" className="size-3.5" />
                    Add set
                  </Button>
                </div>
              )}

              <Button
                onClick={() =>
                  setEntries((current) =>
                    current.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            sets:
                              row.sets.length === 0
                                ? [{ reps: null, weightKg: null }]
                                : [],
                          }
                        : row
                    )
                  )
                }
                size="xs"
                variant="ghost"
              >
                {entries[index]?.sets.length === 0
                  ? "Switch to sets (lift)"
                  : "Switch to distance (run)"}
              </Button>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label className="font-normal" htmlFor="gym-log-rpe">
                Session RPE (1–10)
              </Label>
              <Input
                id="gym-log-rpe"
                inputMode="numeric"
                max={10}
                min={1}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setRpe(
                    event.target.value !== "" &&
                      Number.isFinite(parsed) &&
                      parsed >= 1 &&
                      parsed <= 10
                      ? Math.round(parsed)
                      : null
                  );
                }}
                type="number"
                value={rpe ?? ""}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Checkbox
                aria-label="Mark today as skipped"
                checked={skipped}
                id="gym-skipped"
                onCheckedChange={(checked) => setSkipped(checked === true)}
              />
              <Label className="font-normal text-sm" htmlFor="gym-skipped">
                Missed / skipped today
              </Label>
            </div>
          </div>

          <div className="grid gap-1">
            <Label className="font-normal" htmlFor="gym-log-notes">
              Notes
            </Label>
            <Textarea
              id="gym-log-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="How did it feel? Asthma, energy, tweaks…"
              rows={2}
              value={notes}
            />
          </div>

          {error ? (
            <p
              aria-live="polite"
              className="text-destructive text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={() => onSave({ entries, notes, rpe, skipped, title })}
            >
              {saving ? "Saving…" : "Save session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
