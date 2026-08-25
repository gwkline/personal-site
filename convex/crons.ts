import { cronJobs } from "convex/server";

import { api } from "./_generated/api";

const crons = cronJobs();

crons.hourly("refresh-github-activity", { minuteUTC: 3 }, api.github.sync);

export default crons;
