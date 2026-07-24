import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react";
import { useAction } from "convex/react";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Match from "effect/Match";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DoorOpen,
  Pause,
  Play,
  Shield,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  gameErrorAtom,
  gameStateAtom,
  initialsAtom,
  leaderboardAtom,
  rankedRunAtom,
  submissionAtom,
} from "@/components/depths/depths-atoms";
import type {
  LeaderboardViewState,
  SubmissionState,
} from "@/components/depths/depths-atoms";
import { DepthsCanvas } from "@/components/depths/depths-canvas";
import {
  clearQueuedScoreSubmission,
  getArcadeSessionId,
  LeaderboardClient,
  queueScoreSubmission,
  readQueuedScoreSubmission,
} from "@/components/depths/depths-leaderboard";
import type { DepthsSession } from "@/components/depths/depths-runtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import type { Direction, GameState, RelicKind } from "@/lib/depths/schema";

import { api } from "../../../convex/_generated/api";

const RELIC_LABELS: Record<
  RelicKind,
  { readonly description: string; readonly name: string }
> = {
  "echo-lens": {
    description: "Bank 250 score immediately.",
    name: "Echo Lens",
  },
  "echo-step": {
    description: "Shorten your dodge recovery.",
    name: "Echo Step",
  },
  "ember-edge": {
    description: "Add one permanent attack.",
    name: "Ember Edge",
  },
  "ember-heart": {
    description: "Gain two maximum health.",
    name: "Ember Heart",
  },
  "moss-bloom": {
    description: "Recover three health.",
    name: "Moss Bloom",
  },
  "moss-guard": {
    description: "Gain one maximum health and heal.",
    name: "Moss Guard",
  },
};

const TouchControl = ({
  children,
  label,
  onPress,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  readonly onPress: () => void;
}) => (
  <button
    aria-label={label}
    className="grid size-11 place-content-center rounded-lg border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur active:scale-95"
    onClick={onPress}
    type="button"
  >
    {children}
  </button>
);

const MobileControls = ({
  onAttack,
  onDodge,
  onMove,
}: {
  readonly onAttack: () => void;
  readonly onDodge: () => void;
  readonly onMove: (direction: Direction) => void;
}) => (
  <div className="pointer-events-auto absolute inset-x-3 bottom-3 flex items-end justify-between md:hidden">
    <div className="grid grid-cols-3 gap-1">
      <span />
      <TouchControl label="Move up" onPress={() => onMove("up")}>
        <ChevronUp className="size-5" />
      </TouchControl>
      <span />
      <TouchControl label="Move left" onPress={() => onMove("left")}>
        <ChevronLeft className="size-5" />
      </TouchControl>
      <TouchControl label="Move down" onPress={() => onMove("down")}>
        <ChevronDown className="size-5" />
      </TouchControl>
      <TouchControl label="Move right" onPress={() => onMove("right")}>
        <ChevronRight className="size-5" />
      </TouchControl>
    </div>
    <div className="flex gap-2">
      <TouchControl label="Dodge" onPress={onDodge}>
        <Sparkles className="size-5" />
      </TouchControl>
      <TouchControl label="Attack" onPress={onAttack}>
        <Swords className="size-5" />
      </TouchControl>
    </div>
  </div>
);

const TitleOverlay = ({
  onStart,
}: {
  readonly onStart: (mode: "daily" | "standard") => void;
}) => (
  <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-[#0f0d19]/90 p-5 text-center backdrop-blur-[2px]">
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center py-5">
      <div className="mx-auto mb-5 grid size-14 place-content-center rounded-xl border border-amber-200/20 bg-amber-300/10 text-amber-200">
        <DoorOpen className="size-7" />
      </div>
      <p className="font-mono text-[0.65rem] text-amber-200 uppercase tracking-[0.22em]">
        An endless descent
      </p>
      <h1 className="mt-2 font-heading text-5xl font-semibold text-[#f4ecd8] tracking-[-0.06em] sm:text-6xl">
        Depths
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-[#aaa2b8] text-sm leading-relaxed">
        One room at a time. Read the doorways, clear fights, claim relics from
        reward chambers, and reach the stairs before Dread catches up.
      </p>
      <div className="mt-5 grid gap-2 text-left sm:grid-cols-3">
        {[
          [
            "1 · Explore",
            "Walk to a glowing doorway. Its color hints at what waits.",
          ],
          [
            "2 · Survive",
            "Get close, strike with Space, and dodge enemy contact.",
          ],
          [
            "3 · Descend",
            "Claim relics in reward rooms, then find the blue stairs.",
          ],
        ].map(([title, description]) => (
          <div
            className="rounded-lg border border-white/10 bg-white/5 p-3"
            key={title}
          >
            <span className="font-mono text-[0.65rem] text-amber-200 uppercase">
              {title}
            </span>
            <p className="mt-1 text-[#aaa2b8] text-xs leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 flex justify-center gap-2">
        <Button onClick={() => onStart("standard")} size="lg">
          <Play className="size-4 fill-current" />
          Begin descent
        </Button>
        <Button
          className="border-white/15 bg-white/5 text-white"
          onClick={() => onStart("daily")}
          size="lg"
          variant="outline"
        >
          Daily seed
        </Button>
      </div>
      <KbdGroup className="mt-5 flex-wrap justify-center text-[#8e879a]">
        <Kbd>WASD</Kbd>
        <span>move</span>
        <Kbd>Space</Kbd>
        <span>attack</span>
        <Kbd>Shift</Kbd>
        <span>dodge</span>
      </KbdGroup>
    </div>
  </div>
);

const RewardOverlay = ({
  choices,
  onChoose,
}: {
  readonly choices: readonly RelicKind[];
  readonly onChoose: (relic: RelicKind) => void;
}) => (
  <div className="pointer-events-auto absolute inset-0 grid place-content-center bg-[#0f0d19]/80 p-4 backdrop-blur-sm">
    <div className="w-full max-w-2xl">
      <div className="mb-5 text-center">
        <Sparkles className="mx-auto size-6 text-amber-200" />
        <h2 className="mt-2 font-heading text-3xl text-[#f4ecd8]">
          Choose one relic
        </h2>
        <p className="mt-1 text-[#aaa2b8] text-sm">
          Every find pushes this run toward a different build.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {choices.map((relic) => (
          <button
            className="rounded-xl border border-white/12 bg-[#221e31]/95 p-4 text-left transition-[border-color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-amber-200/40"
            key={relic}
            onClick={() => onChoose(relic)}
            type="button"
          >
            <Shield className="mb-8 size-5 text-amber-200" />
            <span className="block font-heading text-lg text-[#f4ecd8]">
              {RELIC_LABELS[relic].name}
            </span>
            <span className="mt-1 block text-[#aaa2b8] text-xs leading-relaxed">
              {RELIC_LABELS[relic].description}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardRows = ({
  leaderboard,
}: {
  readonly leaderboard: LeaderboardViewState;
}) =>
  Match.value(leaderboard).pipe(
    Match.when({ _tag: "Initial" }, () => (
      <p className="py-3 text-[#8e879a] text-xs">Leaderboard unavailable.</p>
    )),
    Match.when({ _tag: "Loading" }, () => (
      <p className="py-3 text-[#8e879a] text-xs">Loading arcade scores…</p>
    )),
    Match.when({ _tag: "Failure" }, ({ message }) => (
      <p className="py-3 text-red-300 text-xs">{message}</p>
    )),
    Match.when({ _tag: "Success" }, ({ entries }) =>
      entries.length === 0 ? (
        <p className="py-3 text-[#8e879a] text-xs">No scores yet.</p>
      ) : (
        <ol className="mt-2 space-y-1">
          {entries.slice(0, 5).map((entry, index) => (
            <li
              className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded bg-black/20 px-2 py-1 font-mono text-xs"
              key={`${entry.initials}-${entry.score}-${entry.createdAt}`}
            >
              <span className="text-[#756e80]">{index + 1}</span>
              <span className="text-[#e9e0c8]">{entry.initials}</span>
              <span className="text-amber-200">
                {entry.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )
    ),
    Match.exhaustive
  );

const GameOverOverlay = ({
  floor,
  initials,
  leaderboard,
  onInitialsChange,
  onRestart,
  onSubmit,
  score,
  submission,
}: {
  readonly floor: number;
  readonly initials: string;
  readonly leaderboard: LeaderboardViewState;
  readonly onInitialsChange: (value: string) => void;
  readonly onRestart: () => void;
  readonly onSubmit: () => void;
  readonly score: number;
  readonly submission: SubmissionState;
}) => (
  <div className="pointer-events-auto absolute inset-0 grid place-content-center bg-[#0f0d19]/90 p-4 backdrop-blur">
    <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#1c1929] p-6 text-center shadow-2xl">
      <Trophy className="mx-auto size-7 text-amber-200" />
      <h2 className="mt-3 font-heading text-3xl text-[#f4ecd8]">
        The Depths remember
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-black/25 p-3">
          <span className="block font-mono text-[0.6rem] text-[#8e879a] uppercase">
            Score
          </span>
          <span className="mt-1 block font-mono text-xl text-[#f4ecd8]">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="rounded-lg bg-black/25 p-3">
          <span className="block font-mono text-[0.6rem] text-[#8e879a] uppercase">
            Depth
          </span>
          <span className="mt-1 block font-mono text-xl text-[#f4ecd8]">
            {floor}
          </span>
        </div>
      </div>
      <label className="mt-5 block font-mono text-[0.65rem] text-[#aaa2b8] uppercase tracking-[0.15em]">
        Your initials
        <input
          aria-label="Leaderboard initials"
          className="mt-2 block h-12 w-full rounded-lg border border-white/15 bg-black/30 text-center font-mono text-2xl text-[#f4ecd8] uppercase tracking-[0.35em] outline-none focus:border-amber-200/50"
          maxLength={3}
          onChange={(event) => onInitialsChange(event.target.value)}
          value={initials}
        />
      </label>
      <div className="mt-4 text-left">
        <span className="font-mono text-[0.6rem] text-[#8e879a] uppercase tracking-[0.12em]">
          Arcade leaders
        </span>
        <LeaderboardRows leaderboard={leaderboard} />
      </div>
      {Match.value(submission).pipe(
        Match.when({ _tag: "Idle" }, () => (
          <Button
            className="mt-4 w-full"
            disabled={initials.length !== 3}
            onClick={onSubmit}
          >
            Submit score
          </Button>
        )),
        Match.when({ _tag: "Submitting" }, () => (
          <Button className="mt-4 w-full" disabled>
            Submitting…
          </Button>
        )),
        Match.when({ _tag: "Submitted" }, () => (
          <p className="mt-4 text-emerald-300 text-sm">
            Score added to the board.
          </p>
        )),
        Match.when({ _tag: "Failed" }, ({ message }) => (
          <p className="mt-4 text-red-300 text-xs">{message}</p>
        )),
        Match.exhaustive
      )}
      <Button
        className="mt-2 w-full border-white/15 bg-white/5 text-white"
        onClick={onRestart}
        variant="outline"
      >
        Descend again
      </Button>
    </div>
  </div>
);

const renderPhaseOverlay = (
  state: GameState,
  initials: string,
  leaderboard: LeaderboardViewState,
  submission: SubmissionState,
  actions: {
    readonly handleChoose: (relic: RelicKind) => void;
    readonly handleInitialsChange: (value: string) => void;
    readonly handleRestart: () => void;
    readonly handleResume: () => void;
    readonly handleStart: (mode: "daily" | "standard") => void;
    readonly handleSubmit: () => void;
  }
) =>
  Match.value(state.phase).pipe(
    Match.when({ _tag: "Title" }, () => (
      <TitleOverlay onStart={actions.handleStart} />
    )),
    Match.when({ _tag: "Exploring" }, () => null),
    Match.when({ _tag: "Fighting" }, () => null),
    Match.when({ _tag: "ChoosingReward" }, ({ choices }) => (
      <RewardOverlay choices={choices} onChoose={actions.handleChoose} />
    )),
    Match.when({ _tag: "Paused" }, () => (
      <div className="pointer-events-auto absolute inset-0 grid place-content-center bg-[#0f0d19]/75 backdrop-blur-sm">
        <h2 className="font-heading text-4xl text-[#f4ecd8]">Paused</h2>
        <Button className="mt-5" onClick={actions.handleResume}>
          <Play className="size-4 fill-current" />
          Return
        </Button>
      </div>
    )),
    Match.when({ _tag: "GameOver" }, ({ finalFloor, finalScore }) => (
      <GameOverOverlay
        floor={finalFloor}
        initials={initials}
        leaderboard={leaderboard}
        onInitialsChange={actions.handleInitialsChange}
        onRestart={actions.handleRestart}
        onSubmit={actions.handleSubmit}
        score={finalScore}
        submission={submission}
      />
    )),
    Match.exhaustive
  );

const objectiveFor = (state: GameState): string =>
  Match.value(state.phase).pipe(
    Match.when({ _tag: "Title" }, () => "Learn the loop, then begin."),
    Match.when({ _tag: "Exploring" }, () =>
      state.currentRoomId === state.floor.exitRoomId
        ? "Stairway found — descend when ready."
        : "Walk through a glowing doorway."
    ),
    Match.when(
      { _tag: "Fighting" },
      () =>
        `Defeat ${state.enemies.length} enemies · Space to strike · Shift to dodge`
    ),
    Match.when({ _tag: "ChoosingReward" }, () => "Choose one relic."),
    Match.when({ _tag: "Paused" }, () => "Run paused."),
    Match.when({ _tag: "GameOver" }, () => "The run has ended."),
    Match.exhaustive
  );

export const DepthsGame = () => {
  const state = useAtomValue(gameStateAtom);
  const error = useAtomValue(gameErrorAtom);
  const setError = useAtomSet(gameErrorAtom);
  const [initials, setInitials] = useAtom(initialsAtom);
  const [leaderboard, setLeaderboard] = useAtom(leaderboardAtom);
  const [rankedRun, setRankedRun] = useAtom(rankedRunAtom);
  const [submission, setSubmission] = useAtom(submissionAtom);
  const checkpointAction = useAction(api.depths.checkpoint);
  const finishAction = useAction(api.depths.finishRun);
  const listAction = useAction(api.depths.list);
  const startAction = useAction(api.depths.startRun);
  const sessionRef = useRef<DepthsSession | null>(null);
  const onSession = useCallback((session: DepthsSession | null) => {
    sessionRef.current = session;
  }, []);
  const handleMove = useCallback(
    (direction: Direction) => sessionRef.current?.move(direction),
    []
  );
  const leaderboardRuntime = useMemo(
    () =>
      ManagedRuntime.make(
        LeaderboardClient.layer({
          checkpoint: (input) => checkpointAction(input),
          finish: (input) => finishAction(input),
          list: (input) => listAction(input),
          start: (input) => startAction(input),
        })
      ),
    [checkpointAction, finishAction, listAction, startAction]
  );

  useEffect(() => {
    setLeaderboard({ _tag: "Loading" });
    leaderboardRuntime.runCallback(
      Effect.gen(function* syncLeaderboard() {
        const client = yield* LeaderboardClient;
        yield* readQueuedScoreSubmission.pipe(
          Effect.flatMap((queued) =>
            queued
              ? client
                  .finish(queued)
                  .pipe(Effect.andThen(clearQueuedScoreSubmission))
              : Effect.void
          ),
          Effect.catch(() => Effect.void)
        );
        return yield* client.list();
      }),
      {
        onExit: (exit) =>
          Exit.match(exit, {
            onFailure: (cause) =>
              setLeaderboard({
                _tag: "Failure",
                message: String(cause),
              }),
            onSuccess: (entries) =>
              setLeaderboard({ _tag: "Success", entries }),
          }),
      }
    );
    return () => {
      Effect.runFork(leaderboardRuntime.disposeEffect);
    };
  }, [leaderboardRuntime, setLeaderboard]);

  const startRanked = useCallback(
    (mode: "daily" | "standard") => {
      setError(null);
      setSubmission({ _tag: "Idle" });
      const seed =
        mode === "daily"
          ? Math.floor(Date.now() / 86_400_000)
          : Date.now() % 2_147_483_647;
      sessionRef.current?.start(seed);
      leaderboardRuntime.runCallback(
        Effect.gen(function* issueRankedRun() {
          const client = yield* LeaderboardClient;
          const sessionId = yield* getArcadeSessionId;
          const receipt = yield* client.start(mode, sessionId, seed);
          return { receipt, sessionId };
        }),
        {
          onExit: (exit) =>
            Exit.match(exit, {
              onFailure: () => {
                setRankedRun(null);
                setError(
                  "Ranked mode is offline. This run will continue as practice."
                );
              },
              onSuccess: (run) => {
                setRankedRun(run);
              },
            }),
        }
      );
    },
    [leaderboardRuntime, setError, setRankedRun, setSubmission]
  );

  const descend = () => {
    if (!(state && rankedRun)) {
      sessionRef.current?.descend();
      return;
    }
    leaderboardRuntime.runCallback(
      Effect.gen(function* checkpointRun() {
        const client = yield* LeaderboardClient;
        return yield* client.checkpoint({
          elapsedMs: state.elapsedMs,
          floor: state.floor.floor,
          runId: rankedRun.receipt.runId,
          score: state.score,
          sessionId: rankedRun.sessionId,
        });
      }),
      {
        onExit: (exit) => {
          Exit.match(exit, {
            onFailure: () =>
              setError(
                "Checkpoint sync failed. The run continues, but may be practice-only."
              ),
            onSuccess: () => null,
          });
          sessionRef.current?.descend();
        },
      }
    );
  };

  const submitScore = () => {
    if (
      !state ||
      state.phase._tag !== "GameOver" ||
      !rankedRun ||
      initials.length !== 3
    ) {
      setSubmission({
        _tag: "Failed",
        message: "Only completed ranked runs can be submitted.",
      });
      return;
    }
    const completedPhase = state.phase;
    const scoreSubmission = {
      durationMs: state.elapsedMs,
      floor: completedPhase.finalFloor,
      initials,
      runId: rankedRun.receipt.runId,
      score: completedPhase.finalScore,
      sessionId: rankedRun.sessionId,
    };
    setSubmission({ _tag: "Submitting" });
    leaderboardRuntime.runCallback(
      Effect.gen(function* submitRankedScore() {
        const client = yield* LeaderboardClient;
        yield* client.finish(scoreSubmission);
        return yield* client.list();
      }),
      {
        onExit: (exit) =>
          Exit.match(exit, {
            onFailure: () => {
              Effect.runCallback(queueScoreSubmission(scoreSubmission), {
                onExit: (queueExit) =>
                  Exit.match(queueExit, {
                    onFailure: () =>
                      setSubmission({
                        _tag: "Failed",
                        message: "Score submission failed. Please retry.",
                      }),
                    onSuccess: () =>
                      setSubmission({
                        _tag: "Failed",
                        message:
                          "Submission is queued locally; retry when the arcade reconnects.",
                      }),
                  }),
              });
            },
            onSuccess: (entries) => {
              Effect.runFork(clearQueuedScoreSubmission);
              setSubmission({ _tag: "Submitted" });
              setLeaderboard({ _tag: "Success", entries });
            },
          }),
      }
    );
  };

  const handleAttack = useCallback(() => sessionRef.current?.attack(), []);
  const handleChoose = useCallback(
    (relic: RelicKind) => sessionRef.current?.chooseRelic(relic),
    []
  );
  const handleDodge = useCallback(() => sessionRef.current?.dodge(), []);
  const handleInitialsChange = useCallback(
    (value: string) =>
      setInitials(
        value
          .toUpperCase()
          .replaceAll(/[^A-Z]/gu, "")
          .slice(0, 3)
      ),
    [setInitials]
  );
  const handleRestart = useCallback(
    () => startRanked("standard"),
    [startRanked]
  );
  const handleResume = useCallback(() => sessionRef.current?.resume(), []);
  const handleSubmit = submitScore;

  useEffect(() => {
    if (!error) {
      return;
    }
    const timer = window.setTimeout(() => setError(null), 6000);
    return () => window.clearTimeout(timer);
  }, [error, setError]);

  return (
    <section
      aria-label="Depths game"
      className="relative flex size-full min-h-0 flex-col overflow-hidden bg-[#100f1c] text-white"
      data-phase={state?.phase._tag ?? "Loading"}
      data-player-x={state?.player.x}
      data-player-y={state?.player.y}
      data-testid="depths-game"
    >
      <div className="relative z-0 min-h-0 flex-1 overflow-hidden">
        <DepthsCanvas onSession={onSession} />
        {state ? (
          <>
            {state.phase._tag === "Title" ? null : (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 bg-linear-to-b from-[#100f1c]/95 via-[#100f1c]/70 to-transparent p-3 pb-10">
                <div className="max-w-[min(72%,22rem)] rounded-lg border border-white/12 bg-[#161322]/92 px-3 py-2 shadow-lg ring-1 ring-black/40">
                  <p className="font-mono text-[0.6rem] text-amber-200 uppercase tracking-[0.12em]">
                    Depth {state.floor.floor} · Objective
                  </p>
                  <p className="mt-0.5 text-[#e9e0c8] text-xs leading-snug">
                    {objectiveFor(state)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="border-white/10 bg-[#161322]/92 text-white shadow-lg">
                    {state.phase._tag}
                  </Badge>
                  {state.phase._tag !== "Paused" &&
                  state.phase._tag !== "GameOver" ? (
                    <Button
                      aria-label="Pause run"
                      className="pointer-events-auto border-white/15 bg-[#161322]/92 text-white hover:bg-[#221e31]"
                      onClick={() => sessionRef.current?.pause()}
                      size="icon-sm"
                      variant="outline"
                    >
                      <Pause className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
            {error ? (
              <div className="absolute inset-x-3 top-19 z-30 flex justify-center md:top-16">
                <output className="flex max-w-md items-start gap-2 rounded-lg border border-amber-200/25 bg-[#2a2214]/95 px-3 py-2 text-left text-amber-50 text-xs shadow-xl backdrop-blur-sm">
                  <span className="min-w-0 flex-1 leading-relaxed">
                    {error}
                  </span>
                  <button
                    aria-label="Dismiss notice"
                    className="pointer-events-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.65rem] text-amber-100/80 uppercase tracking-wider hover:bg-white/10"
                    onClick={() => setError(null)}
                    type="button"
                  >
                    Dismiss
                  </button>
                </output>
              </div>
            ) : null}
            {state.phase._tag === "Exploring" &&
            state.currentRoomId === state.floor.exitRoomId ? (
              <Button
                className="absolute bottom-28 left-1/2 z-30 -translate-x-1/2 shadow-xl md:bottom-6"
                onClick={descend}
              >
                Descend to depth {state.floor.floor + 1}
              </Button>
            ) : null}
            {state.phase._tag === "Fighting" ? (
              <div className="absolute right-4 bottom-4 z-20 hidden gap-2 md:flex">
                <Button
                  className="border-white/15 bg-black/45 text-white"
                  onClick={handleDodge}
                  size="lg"
                  variant="outline"
                >
                  Shift · Dodge
                </Button>
                <Button onClick={handleAttack} size="lg">
                  <Swords className="size-4" />
                  Space · Strike
                </Button>
              </div>
            ) : null}
            <div className="pointer-events-none absolute inset-0 z-10">
              <MobileControls
                onAttack={handleAttack}
                onDodge={handleDodge}
                onMove={handleMove}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 z-40">
              {/* Ref access is confined to the callbacks passed to this pure view helper. */}
              {/* eslint-disable-next-line react-compiler/react-compiler */}
              {renderPhaseOverlay(state, initials, leaderboard, submission, {
                handleChoose,
                handleInitialsChange,
                handleRestart,
                handleResume,
                handleStart: startRanked,
                handleSubmit,
              })}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 z-20 grid place-content-center bg-[#100f1c] font-mono text-xs text-[#8e879a] uppercase tracking-[0.16em]">
            Waking the dungeon…
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {state
          ? `Depth ${state.floor.floor}. ${state.phase._tag}. Health ${state.hp} of ${state.maxHp}. Score ${state.score}.`
          : "Depths is loading."}
      </p>
    </section>
  );
};
