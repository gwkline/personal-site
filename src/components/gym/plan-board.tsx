import { PencilLine, Plus, Trash2 } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import type { PlanDay, PlanDayKind, PlanItem } from "@/lib/gym/types";

import { KindDot } from "./today-hero";

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const KINDS: PlanDayKind[] = ["lift", "run", "rest", "cross-train"];
const INTENSITIES = ["easy", "steady", "tempo", "intervals"] as const;

const emptyItem = (): PlanItem => ({
  distanceKm: null,
  durationMin: null,
  incrementKg: null,
  intensity: null,
  name: "",
  notes: null,
  repMax: null,
  repMin: null,
  sets: null,
  targetWeightKg: null,
});

const itemSummary = (item: PlanItem) => {
  if (item.sets !== null) {
    const reps =
      item.repMin !== null &&
      item.repMax !== null &&
      item.repMin !== item.repMax
        ? `${item.repMin}–${item.repMax}`
        : (item.repMin ?? item.repMax ?? "");
    const weight =
      item.targetWeightKg !== null && item.targetWeightKg > 0
        ? ` @ ${item.targetWeightKg} kg`
        : "";
    return `${item.sets}×${reps}${weight}`;
  }
  const distance = item.distanceKm === null ? null : `${item.distanceKm} km`;
  const duration = item.durationMin === null ? null : `${item.durationMin} min`;
  const intensity = item.intensity || null;
  return [distance, duration, intensity].filter(Boolean).join(" · ") || "—";
};

const NumberField = ({
  label,
  onChange,
  step = 1,
  value,
}: {
  label: string;
  onChange: (value: number | null) => void;
  step?: number;
  value: number | null;
}) => (
  <label className="grid gap-1">
    <span className="font-medium text-muted-foreground text-xs">{label}</span>
    <Input
      aria-label={label}
      inputMode="decimal"
      onChange={(event) => {
        const raw = event.target.value;
        const parsed = Number(raw);
        onChange(raw !== "" && Number.isFinite(parsed) ? parsed : null);
      }}
      step={step}
      type="number"
      value={value === null ? "" : value}
    />
  </label>
);

const ToggleRow = <T extends string>({
  onChange,
  options,
  render,
  value,
}: {
  onChange: (value: T) => void;
  options: readonly T[];
  render: (option: T) => string;
  value: T;
}) => (
  <fieldset className="flex w-fit gap-1 rounded-lg bg-muted p-1">
    <legend className="sr-only">Select</legend>
    {options.map((option) => (
      <Button
        aria-pressed={option === value}
        className="capitalize"
        key={option}
        onClick={() => onChange(option)}
        size="xs"
        variant={option === value ? "secondary" : "ghost"}
      >
        {render(option)}
      </Button>
    ))}
  </fieldset>
);

const DayEditor = ({
  day,
  error,
  onCancel,
  onSave,
  saving,
}: {
  day: PlanDay;
  error: string | null;
  onCancel: () => void;
  onSave: (day: PlanDay) => void;
  saving: boolean;
}) => {
  const [draft, setDraft] = useState<PlanDay>(day);
  const setItem = (index: number, patch: Partial<PlanItem>) =>
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <Label className="font-normal" htmlFor="gym-day-title">
          Session title
        </Label>
        <Input
          id="gym-day-title"
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          value={draft.title}
        />
      </div>
      <div className="grid gap-1">
        <span className="font-medium text-sm">Day type</span>
        <ToggleRow
          onChange={(kind) =>
            setDraft((current) => ({
              ...current,
              items: kind === "rest" ? [] : current.items,
              kind,
            }))
          }
          options={KINDS}
          render={(kind) => kind}
          value={draft.kind}
        />
      </div>

      {draft.kind === "rest" ? (
        <p className="text-muted-foreground text-sm">
          Rest day — nothing to program.
        </p>
      ) : (
        <div className="grid gap-3">
          {draft.items.map((item, index) => (
            <div
              className="grid gap-2 rounded-lg border bg-surface-sunken p-3"
              key={index}
            >
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Exercise name"
                  className="flex-1"
                  onChange={(event) =>
                    setItem(index, { name: event.target.value })
                  }
                  placeholder="Exercise or run"
                  value={item.name}
                />
                <Button
                  aria-label={`Remove ${item.name || "item"}`}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      items: current.items.toSpliced(index, 1),
                    }))
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
              {draft.kind === "run" ? (
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Distance (km)"
                    onChange={(value) => setItem(index, { distanceKm: value })}
                    step={0.5}
                    value={item.distanceKm}
                  />
                  <NumberField
                    label="Duration (min)"
                    onChange={(value) => setItem(index, { durationMin: value })}
                    value={item.durationMin}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <NumberField
                    label="Sets"
                    onChange={(value) => setItem(index, { sets: value })}
                    value={item.sets}
                  />
                  <NumberField
                    label="Rep min"
                    onChange={(value) => setItem(index, { repMin: value })}
                    value={item.repMin}
                  />
                  <NumberField
                    label="Rep max"
                    onChange={(value) => setItem(index, { repMax: value })}
                    value={item.repMax}
                  />
                  <NumberField
                    label="Target (kg)"
                    onChange={(value) =>
                      setItem(index, { targetWeightKg: value })
                    }
                    step={1.25}
                    value={item.targetWeightKg}
                  />
                </div>
              )}
              <div className="grid gap-1">
                <span className="font-medium text-muted-foreground text-xs">
                  {draft.kind === "run" ? "Intensity" : "Notes"}
                </span>
                {draft.kind === "run" ? (
                  <ToggleRow
                    onChange={(intensity) => setItem(index, { intensity })}
                    options={INTENSITIES}
                    render={(option) => option}
                    value={item.intensity ?? "easy"}
                  />
                ) : (
                  <Input
                    aria-label="Item notes"
                    onChange={(event) =>
                      setItem(index, { notes: event.target.value })
                    }
                    placeholder="e.g. pause at the bottom"
                    value={item.notes ?? ""}
                  />
                )}
              </div>
            </div>
          ))}
          <Button
            onClick={() =>
              setDraft((current) => ({
                ...current,
                items: [...current.items, emptyItem()],
              }))
            }
            variant="outline"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add item
          </Button>
        </div>
      )}

      {error ? (
        <p aria-live="polite" className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="ghost">
          Cancel
        </Button>
        <Button
          disabled={saving}
          onClick={() => {
            const normalizedItems = draft.items
              .filter((item) => item.name.trim() !== "")
              .map((item) => ({ ...item, name: item.name.trim() }));
            onSave({ ...draft, items: normalizedItems });
          }}
        >
          {saving ? "Saving…" : "Save day"}
        </Button>
      </div>
    </div>
  );
};

export const PlanBoard = ({
  editing,
  isOwner,
  onEditClose,
  onEditOpen,
  onSaveDay,
  planDays,
  planName,
  planVersion,
  saveError,
  saving,
}: {
  editing: number | null;
  isOwner: boolean;
  onEditClose: () => void;
  onEditOpen: (dayOfWeek: number) => void;
  onSaveDay: (day: PlanDay) => void;
  planDays: PlanDay[];
  planName: string | null;
  planVersion: number | null;
  saveError: string | null;
  saving: boolean;
}) => {
  const editingDay = planDays.find((day) => day.dayOfWeek === editing) ?? null;

  return (
    <section aria-labelledby="gym-plan-title" className="space-y-5">
      <SectionHeader
        description="The active weekly template. Every change creates a new version with its reason kept."
        eyebrow="The program"
        id="gym-plan-title"
        title="This week's plan"
      />
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {planName ?? "No plan yet"}
        </h2>
        {planVersion === null ? null : (
          <Badge variant="outline" className="font-mono">
            v{planVersion}
          </Badge>
        )}
      </div>
      {planDays.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nothing programmed yet.
            {isOwner
              ? " Load demo data below to start from a balanced template."
              : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {planDays.map((day) => (
            <Card className="flex flex-col" key={day.dayOfWeek}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KindDot kind={day.kind} />
                  {DAY_LABELS[day.dayOfWeek]}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {day.title}
                </CardDescription>
                {isOwner ? (
                  <CardAction>
                    <Button
                      aria-label={`Edit ${DAY_LABELS[day.dayOfWeek]}`}
                      onClick={() => onEditOpen(day.dayOfWeek)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <PencilLine aria-hidden="true" className="size-4" />
                    </Button>
                  </CardAction>
                ) : null}
              </CardHeader>
              <CardContent className="mt-auto space-y-1.5">
                {day.kind === "rest" ? (
                  <p className="text-muted-foreground text-xs">
                    Full rest day.
                  </p>
                ) : (
                  day.items.map((item) => (
                    <p
                      className="flex justify-between gap-2 text-sm"
                      key={item.name}
                    >
                      <span className="min-w-0 truncate">{item.name}</span>
                      <span className="font-mono text-muted-foreground text-xs whitespace-nowrap">
                        {itemSummary(item)}
                      </span>
                    </p>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            onEditClose();
          }
        }}
        open={editing !== null}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Edit {editingDay ? DAY_LABELS[editingDay.dayOfWeek] : ""}
            </DialogTitle>
            <DialogDescription>
              Saving creates plan v{(planVersion ?? 1) + 1} with this day
              applied.
            </DialogDescription>
          </DialogHeader>
          {editingDay ? (
            <DayEditor
              day={editingDay}
              error={saveError}
              onCancel={onEditClose}
              onSave={onSaveDay}
              saving={saving}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};
