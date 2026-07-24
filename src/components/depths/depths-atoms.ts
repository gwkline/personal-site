import * as Atom from "effect/unstable/reactivity/Atom";

import type {
  GameState,
  LeaderboardEntry,
  RunReceipt,
} from "@/lib/depths/schema";

export const gameStateAtom = Atom.make<GameState | null>(null).pipe(
  Atom.keepAlive
);

export const gameErrorAtom = Atom.make<string | null>(null).pipe(
  Atom.keepAlive
);

export const initialsAtom = Atom.make("AAA").pipe(Atom.keepAlive);

export type LeaderboardViewState =
  | { readonly _tag: "Initial" }
  | { readonly _tag: "Loading" }
  | {
      readonly _tag: "Success";
      readonly entries: readonly LeaderboardEntry[];
    }
  | { readonly _tag: "Failure"; readonly message: string };

export const leaderboardAtom = Atom.make<LeaderboardViewState>({
  _tag: "Initial",
}).pipe(Atom.keepAlive);

export interface RankedRun {
  readonly receipt: RunReceipt;
  readonly sessionId: string;
}

export const rankedRunAtom = Atom.make<RankedRun | null>(null).pipe(
  Atom.keepAlive
);

export type SubmissionState =
  | { readonly _tag: "Idle" }
  | { readonly _tag: "Submitting" }
  | { readonly _tag: "Submitted" }
  | { readonly _tag: "Failed"; readonly message: string };

export const submissionAtom = Atom.make<SubmissionState>({
  _tag: "Idle",
}).pipe(Atom.keepAlive);
