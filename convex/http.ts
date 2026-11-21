import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);

// Accountability nudge status for scripts/gym-nudge.ts. Public read, same
// trust model as the 75-hard tracker: the flag itself lives in gymSettings,
// so the script stays config-free and safely does nothing when it's off.
http.route({
  handler: httpAction(async (ctx, request) => {
    const status = await ctx.runQuery(internal.gym.getNudgeStatus, {});
    void request;
    return Response.json(
      {
        date: status.date,
        enabled: status.enabled,
        loggedToday: status.loggedToday,
        plannedTitle: status.plannedTitle,
        streak: status.streak,
      },
      {
        headers: {
          "access-control-allow-origin": "*",
          "cache-control": "no-store",
          "content-type": "application/json",
        },
        status: 200,
      }
    );
  }),
  method: "GET",
  path: "/api/gym/nudge-status",
});

export default http;
