import { useAction, useMutation } from "convex/react";
import { Bot, MessageSquareText, Send, Sparkles } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { CoachChange } from "@/lib/gym/types";

import { api } from "../../../convex/_generated/api";

interface TodayResult {
  headline: string;
  notes: string | null;
  reasoning: string;
}

interface AdjustDraft {
  changes: CoachChange[];
  days: unknown | null;
  error: string | null;
  explanation: string;
}

export const CoachPanel = ({
  nudgeEnabled,
  onToggleNudge,
  planVersion,
}: {
  nudgeEnabled: boolean;
  onToggleNudge: (enabled: boolean) => Promise<void>;
  planVersion: number | null;
}) => {
  const runToday = useAction(api.gymCoach.today);
  const runAdjust = useAction(api.gymCoach.adjustPlan);
  const applyDraft = useMutation(api.gym.applyPlanDraft);

  const [today, setToday] = useState<TodayResult | null>(null);
  const [todayBusy, setTodayBusy] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);

  const [instruction, setInstruction] = useState("");
  const [draft, setDraft] = useState<AdjustDraft | null>(null);
  const [adjustBusy, setAdjustBusy] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [applyBusy, setApplyBusy] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [nudgeBusy, setNudgeBusy] = useState(false);

  const askToday = async () => {
    setTodayBusy(true);
    setTodayError(null);
    try {
      const result = await runToday({});
      setToday(result);
    } catch (error) {
      setTodayError(
        error instanceof Error ? error.message : "Coach call failed"
      );
    } finally {
      setTodayBusy(false);
    }
  };

  const askAdjust = async () => {
    if (instruction.trim() === "") {
      return;
    }
    setAdjustBusy(true);
    setAdjustError(null);
    setAppliedNotice(null);
    try {
      const result = await runAdjust({ instruction });
      setDraft(result);
    } catch (error) {
      setAdjustError(
        error instanceof Error ? error.message : "Coach call failed"
      );
    } finally {
      setAdjustBusy(false);
    }
  };

  const applyPlan = async () => {
    if (!draft?.days) {
      return;
    }
    setApplyBusy(true);
    try {
      await applyDraft({
        days: draft.days as Parameters<typeof applyDraft>[0]["days"],
        reason: `Coach: ${instruction.trim().slice(0, 180)}`,
      });
      setAppliedNotice(
        `Applied — plan v${(planVersion ?? 1) + 1} is live. The old version is kept as history.`
      );
      setDraft(null);
      setInstruction("");
    } catch (error) {
      setAdjustError(error instanceof Error ? error.message : "Apply failed");
    } finally {
      setApplyBusy(false);
    }
  };

  return (
    <section aria-labelledby="gym-coach-title" className="space-y-5">
      <SectionHeader
        description="GLM-5.3 over the opencode-go subscription. Drafts only — nothing touches the plan without your click, and every call is logged."
        eyebrow="The coach"
        id="gym-coach-title"
        title="Coach"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card elevated>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText
                aria-hidden="true"
                className="size-4 text-primary"
              />
              What should I do today?
            </CardTitle>
            <CardDescription>
              Grounded in the plan, the last 14 days, and your RPE notes.
            </CardDescription>
            <CardAction>
              <Button disabled={todayBusy} onClick={askToday} size="sm">
                {todayBusy ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Sparkles aria-hidden="true" className="size-3.5" />
                )}
                Ask
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayError ? (
              <p
                aria-live="polite"
                className="text-destructive text-sm"
                role="alert"
              >
                {todayError}
              </p>
            ) : null}
            {today ? (
              <div className="space-y-2">
                <p className="font-medium">{today.headline}</p>
                <p className="text-muted-foreground text-sm">
                  {today.reasoning}
                </p>
                {today.notes ? (
                  <Badge variant="secondary">{today.notes}</Badge>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No advice yet this session.
              </p>
            )}
          </CardContent>
        </Card>

        <Card elevated>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot aria-hidden="true" className="size-4 text-primary" />
              Adjust the plan
            </CardTitle>
            <CardDescription>
              Tell it what to change. It returns a full draft with reasons, then
              you apply it or drop it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              aria-label="Instruction for the coach"
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="e.g. I have a late work Thursday — move the tempo run to Friday morning and keep legs easy this week."
              rows={3}
              value={instruction}
            />
            <Button
              disabled={adjustBusy || instruction.trim() === ""}
              onClick={askAdjust}
            >
              {adjustBusy ? (
                <Spinner className="size-3.5" />
              ) : (
                <Send aria-hidden="true" className="size-3.5" />
              )}
              Draft a revision
            </Button>

            {adjustError ? (
              <p
                aria-live="polite"
                className="text-destructive text-sm"
                role="alert"
              >
                {adjustError}
              </p>
            ) : null}
            {appliedNotice ? (
              <output className="text-sm text-info">{appliedNotice}</output>
            ) : null}

            {draft ? (
              <div className="space-y-3 rounded-lg border bg-surface-sunken p-3">
                {draft.error ? (
                  <p className="text-destructive text-sm">{draft.error}</p>
                ) : (
                  <>
                    <p className="text-sm">{draft.explanation}</p>
                    <ul className="space-y-1.5">
                      {draft.changes.map((change, index) => (
                        <li
                          className="text-muted-foreground text-xs"
                          key={index}
                        >
                          <span className="font-medium text-foreground">
                            {change.summary}
                          </span>
                          {change.before || change.after ? (
                            <span className="ml-1 font-mono">
                              {change.before ?? "—"} → {change.after ?? "—"}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button
                        disabled={applyBusy}
                        onClick={applyPlan}
                        size="sm"
                      >
                        {applyBusy ? "Applying…" : "Apply as new version"}
                      </Button>
                      <Button
                        onClick={() => setDraft(null)}
                        size="sm"
                        variant="ghost"
                      >
                        Drop it
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Accountability nudge</CardTitle>
            <CardDescription>
              Off by default. When on, a Mac-side script texts the day&apos;s
              open session via the Photon path each evening (see docs/gym).
            </CardDescription>
            <CardAction>
              <div className="flex items-center gap-2">
                <Checkbox
                  aria-label="Enable daily nudge"
                  checked={nudgeEnabled}
                  disabled={nudgeBusy}
                  id="gym-nudge"
                  onCheckedChange={(checked) => {
                    const next = async () => {
                      setNudgeBusy(true);
                      try {
                        await onToggleNudge(checked === true);
                      } finally {
                        setNudgeBusy(false);
                      }
                    };
                    return next();
                  }}
                />
                <Label className="font-normal text-sm" htmlFor="gym-nudge">
                  Daily text nudge
                </Label>
              </div>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
};
