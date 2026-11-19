/**
 * Gym accountability nudge — the flagged-off-by-default texting loop.
 *
 *   bun scripts/gym-nudge.ts
 *
 * Flow (docs/gym/03-architecture.md): fetch GET {GYM_NUDGE_URL}/api/gym/nudge-status
 * from the Convex deployment; if the flag is off or today is already logged,
 * exit 0 silently. Otherwise text the open session through the Photon path:
 *
 *   hermes send --to photon:+15714399249 "<message>"
 *
 * Env:
 *   GYM_NUDGE_URL  Convex site base (…convex.site). Default: the dev deployment.
 *   GYM_NUDGE_TO   Destination in hermes form (photon:+1…). Default: Gavin's cell.
 *
 * Schedule it with a Hermes cron (~17:30 ET) once the flag is flipped on —
 * see roadmap issue "register daily nudge cron".
 */

const DEFAULT_BASE_URL = "https://glad-meadowlark-891.convex.site";
const DEFAULT_TO = "photon:+15714399249";
const SITE_LINK = "https://gavinkline.com/gym";

interface NudgeStatus {
  date: string;
  enabled: boolean;
  loggedToday: boolean;
  plannedTitle: string | null;
  streak: number;
}

const fail = (message: string): never => {
  console.error(`gym-nudge: ${message}`);
  process.exit(1);
};

const main = async () => {
  const base = (process.env.GYM_NUDGE_URL ?? DEFAULT_BASE_URL).replace(
    /\/$/u,
    ""
  );
  const to = process.env.GYM_NUDGE_TO ?? DEFAULT_TO;

  const response = await fetch(`${base}/api/gym/nudge-status`, {
    headers: { accept: "application/json" },
  }).catch((error: unknown) =>
    fail(
      `nudge-status fetch failed: ${error instanceof Error ? error.message : "unknown"}`
    )
  );
  if (response.status !== 200) {
    fail(`nudge-status returned HTTP ${response.status}`);
  }
  const status = (await response.json()) as NudgeStatus;
  if (!status.enabled || status.loggedToday) {
    // Flag off or work done — stay silent, exit clean.
    process.exit(0);
  }

  const planned = status.plannedTitle ?? "today's session";
  const streak =
    status.streak > 0
      ? ` Streak: ${status.streak} day${status.streak === 1 ? "" : "s"}.`
      : "";
  const message = `Gym: ${planned} is still open today.${streak} ${SITE_LINK}`;

  const proc = Bun.spawn(["hermes", "send", "--to", to, message], {
    stderr: "pipe",
    stdout: "pipe",
  });
  const code = await proc.exited;
  if (code !== 0) {
    const err = await new Response(proc.stderr).text();
    fail(`hermes send exited ${code}: ${err.trim().slice(0, 200)}`);
  }
  console.log(`gym-nudge: sent for ${status.date} (${planned})`);
};

await main();
