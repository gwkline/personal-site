import { createStart } from "@tanstack/react-start";

import { agentDiscovery } from "@/server/agent-middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [agentDiscovery],
}));
