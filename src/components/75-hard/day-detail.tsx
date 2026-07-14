import { useMutation } from "convex/react";
import {
  Camera,
  Check,
  Eye,
  ImagePlus,
  Loader2,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChallengeDay, RequirementKey } from "@/lib/hard75";
import {
  formatChallengeDate,
  REQUIREMENT_COUNT,
  REQUIREMENTS,
} from "@/lib/hard75";
import { cn } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface DayDraft {
  diet: boolean;
  note: string;
  outdoors: boolean;
  progressPhoto: boolean;
  reading: boolean;
  runMiles: string;
  water: boolean;
  workoutOne: boolean;
  workoutTwo: boolean;
}

const draftFromDay = (day: ChallengeDay): DayDraft => ({
  diet: day.diet,
  note: day.note ?? "",
  outdoors: day.outdoors,
  progressPhoto: day.progressPhoto,
  reading: day.reading,
  runMiles: day.runMiles?.toString() ?? "",
  water: day.water,
  workoutOne: day.workoutOne,
  workoutTwo: day.workoutTwo,
});

const ReadOnlyDay = ({ day }: { day: ChallengeDay }) => (
  <div className="space-y-6">
    <div className="grid gap-2">
      {REQUIREMENTS.map((requirement) => (
        <div
          className={cn(
            "flex min-h-11 items-center justify-between rounded-xl border px-3.5 py-2.5",
            day[requirement.key]
              ? "border-success/30 bg-success/10"
              : "bg-surface-sunken text-muted-foreground"
          )}
          key={requirement.key}
        >
          <span className="text-sm">{requirement.label}</span>
          <span
            className={cn(
              "grid size-6 place-content-center rounded-full",
              day[requirement.key] &&
                "bg-success text-white dark:text-background"
            )}
          >
            {day[requirement.key] ? <Check className="size-3.5" /> : "—"}
          </span>
        </div>
      ))}
    </div>
    {day.runMiles !== undefined || day.note ? (
      <div className="grid gap-4 rounded-xl border bg-surface-sunken p-4">
        {day.runMiles === undefined ? null : (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Running
            </p>
            <p className="mt-1 font-mono text-xl tabular-nums">
              {day.runMiles.toFixed(1)} miles
            </p>
          </div>
        )}
        {day.note ? (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Field note
            </p>
            <p className="mt-1 text-sm leading-relaxed">{day.note}</p>
          </div>
        ) : null}
      </div>
    ) : null}
    {day.publicPhotoUrl ? (
      <img
        alt={`Day ${day.dayIndex}`}
        className="max-h-96 w-full rounded-xl border object-cover"
        src={day.publicPhotoUrl}
      />
    ) : null}
  </div>
);

const OwnerDayEditor = ({ day }: { day: ChallengeDay }) => {
  const updateDay = useMutation(api.hard75.updateDay);
  const generateUploadUrl = useMutation(api.hard75.generatePhotoUploadUrl);
  const saveProgressPhoto = useMutation(api.hard75.saveProgressPhoto);
  const savePublicPhoto = useMutation(api.hard75.savePublicPhoto);
  const removeProgressPhoto = useMutation(api.hard75.removeProgressPhoto);
  const removePublicPhoto = useMutation(api.hard75.removePublicPhoto);
  const [draft, setDraft] = useState(() => draftFromDay(day));
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<
    "progress" | "public" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const toggleRequirement = (key: RequirementKey, checked: boolean) => {
    setDraft((current) => ({ ...current, [key]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const parsedMiles =
        draft.runMiles.trim() === "" ? undefined : Number(draft.runMiles);
      await updateDay({
        date: day.date,
        dayIndex: day.dayIndex,
        diet: draft.diet,
        note: draft.note.trim() || undefined,
        outdoors: draft.outdoors,
        progressPhoto: draft.progressPhoto,
        reading: draft.reading,
        runMiles: parsedMiles,
        water: draft.water,
        workoutOne: draft.workoutOne,
        workoutTwo: draft.workoutTwo,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this day"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "progress" | "public"
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Photos must be smaller than 8 MB");
      return;
    }
    setUploadingPhoto(kind);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Photo upload failed");
      }
      const result = (await response.json()) as { storageId: Id<"_storage"> };
      const photo = {
        date: day.date,
        dayIndex: day.dayIndex,
        storageId: result.storageId,
      };
      if (kind === "progress") {
        await saveProgressPhoto(photo);
        setDraft((current) => ({ ...current, progressPhoto: true }));
      } else {
        await savePublicPhoto(photo);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload this photo"
      );
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleRemovePhoto = async (kind: "progress" | "public") => {
    setError(null);
    try {
      const photo = { date: day.date, dayIndex: day.dayIndex };
      await (kind === "progress"
        ? removeProgressPhoto(photo)
        : removePublicPhoto(photo));
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove this photo"
      );
    }
  };

  return (
    <div className="space-y-7">
      <FieldGroup data-slot="checkbox-group">
        {REQUIREMENTS.map((requirement) => (
          <FieldLabel key={requirement.key}>
            <Field orientation="horizontal">
              <Checkbox
                checked={draft[requirement.key]}
                onCheckedChange={(checked) =>
                  toggleRequirement(requirement.key, checked)
                }
              />
              <FieldContent>
                <FieldTitle>{requirement.label}</FieldTitle>
              </FieldContent>
            </Field>
          </FieldLabel>
        ))}
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field>
          <FieldLabel htmlFor={`miles-${day.dayIndex}`}>Run miles</FieldLabel>
          <Input
            id={`miles-${day.dayIndex}`}
            inputMode="decimal"
            max="100"
            min="0"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                runMiles: event.target.value,
              }))
            }
            placeholder="0.0"
            step="0.1"
            type="number"
            value={draft.runMiles}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`note-${day.dayIndex}`}>Field note</FieldLabel>
          <Textarea
            id={`note-${day.dayIndex}`}
            maxLength={500}
            onChange={(event) =>
              setDraft((current) => ({ ...current, note: event.target.value }))
            }
            placeholder="Long run, hard lesson, small win…"
            value={draft.note}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <div className="flex items-start justify-between gap-3">
            <FieldContent>
              <FieldTitle>Progress photo</FieldTitle>
              <FieldDescription>
                Private. Counts toward the daily task.
              </FieldDescription>
            </FieldContent>
            <Input
              accept="image/*"
              className="sr-only"
              disabled={uploadingPhoto !== null}
              id={`progress-photo-${day.dayIndex}`}
              onChange={(event) => handlePhotoUpload(event, "progress")}
              type="file"
            />
            <Button
              nativeButton={false}
              render={
                <label
                  aria-label="Upload private progress photo"
                  htmlFor={`progress-photo-${day.dayIndex}`}
                />
              }
              size="sm"
              variant="outline"
            >
              {uploadingPhoto === "progress" ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {day.progressPhotoUrl ? "Replace" : "Add"}
            </Button>
          </div>
          {day.progressPhotoUrl ? (
            <div className="overflow-hidden rounded-xl border">
              <img
                alt={`Private progress from day ${day.dayIndex}`}
                className="aspect-4/3 w-full object-cover"
                src={day.progressPhotoUrl}
              />
              <div className="flex items-center justify-between border-t bg-surface-sunken p-2.5 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Only you
                </span>
                <Button
                  aria-label="Remove progress photo"
                  onClick={() => handleRemovePhoto("progress")}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-32 place-content-center rounded-xl border border-dashed bg-surface-sunken text-center">
              <Camera className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-muted-foreground text-xs">No progress photo</p>
            </div>
          )}
        </Field>

        <Field>
          <div className="flex items-start justify-between gap-3">
            <FieldContent>
              <FieldTitle>Public photo</FieldTitle>
              <FieldDescription>
                Optional. Shown to visitors for this day.
              </FieldDescription>
            </FieldContent>
            <Input
              accept="image/*"
              className="sr-only"
              disabled={uploadingPhoto !== null}
              id={`public-photo-${day.dayIndex}`}
              onChange={(event) => handlePhotoUpload(event, "public")}
              type="file"
            />
            <Button
              nativeButton={false}
              render={
                <label
                  aria-label="Upload public day photo"
                  htmlFor={`public-photo-${day.dayIndex}`}
                />
              }
              size="sm"
              variant="outline"
            >
              {uploadingPhoto === "public" ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {day.publicPhotoUrl ? "Replace" : "Add"}
            </Button>
          </div>
          {day.publicPhotoUrl ? (
            <div className="overflow-hidden rounded-xl border">
              <img
                alt={`Public update from day ${day.dayIndex}`}
                className="aspect-4/3 w-full object-cover"
                src={day.publicPhotoUrl}
              />
              <div className="flex items-center justify-between border-t bg-surface-sunken p-2.5 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  Public
                </span>
                <Button
                  aria-label="Remove public photo"
                  onClick={() => handleRemovePhoto("public")}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-32 place-content-center rounded-xl border border-dashed bg-surface-sunken text-center">
              <ImagePlus className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-muted-foreground text-xs">No public photo</p>
            </div>
          )}
        </Field>
      </div>

      <FieldError>{error}</FieldError>

      <Button
        className="w-full"
        disabled={isSaving}
        onClick={handleSave}
        size="lg"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check />}
        Save day {day.dayIndex}
      </Button>
    </div>
  );
};

export const DayDetail = ({
  day,
  isOwner,
  onOpenChange,
  open,
}: {
  day: ChallengeDay | null;
  isOwner: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => (
  <Drawer onOpenChange={onOpenChange} open={open} showSwipeHandle>
    <DrawerContent>
      {day ? (
        <>
          <DrawerHeader className="mx-auto w-full max-w-2xl border-b pb-4 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Day {day.dayIndex} of 75
                </p>
                <DrawerTitle className="font-heading text-3xl font-semibold tracking-[-0.035em]">
                  {formatChallengeDate(day.date, {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                  })}
                </DrawerTitle>
                <DrawerDescription>
                  {day.completedCount} of {REQUIREMENT_COUNT} tasks complete
                </DrawerDescription>
              </div>
              <Button
                aria-label="Close day details"
                onClick={() => onOpenChange(false)}
                size="icon-sm"
                variant="ghost"
              >
                <X />
              </Button>
            </div>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl p-4 pb-8 sm:p-6">
              {isOwner ? (
                <OwnerDayEditor day={day} key={day.updatedAt} />
              ) : (
                <ReadOnlyDay day={day} />
              )}
              {!isOwner && day.publicPhotoUrl ? (
                <p className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Eye className="size-3.5" />
                  Shared publicly
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </DrawerContent>
  </Drawer>
);
