import { useMutation, useQuery } from "convex/react";
import { Activity, MessageCircle } from "lucide-react";
import { useRef, useEffect } from "react";

import { useCommentSidebar } from "@/components/comments-sidebar";
import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { api } from "../../convex/_generated/api";

const generateSessionId = () => {
  const stored = localStorage.getItem("session-id");
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  localStorage.setItem("session-id", id);
  return id;
};
const usePresence = () => {
  const heartbeat = useMutation(api.presence.heartbeat);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    sessionIdRef.current = generateSessionId();
    // Initial heartbeat
    heartbeat({ sessionId: sessionIdRef.current });
    // Send heartbeat every 15 seconds
    const interval = setInterval(() => {
      if (sessionIdRef.current) {
        heartbeat({ sessionId: sessionIdRef.current });
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [heartbeat]);
};
export const LiveStatsNav = () => {
  const stats = useQuery(api.presence.getStats);
  const recentComments = useQuery(api.comments.listRecent, { limit: 5 });
  const { toggle, isOpen } = useCommentSidebar();
  usePresence();
  return (
    <div className="flex items-center gap-1" data-testid="live-stats-nav">
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="flex cursor-help items-center gap-1.5 rounded-md px-2 py-1 text-xs" />
          }
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-2 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-chart-2" />
          </span>
          <MonoLabel className="tabular-nums" render={<span />} tone="inherit">
            {stats?.activeUsers ?? 0}
          </MonoLabel>
          <span className="hidden text-muted-foreground lg:inline">online</span>
        </TooltipTrigger>
        <TooltipContent>Users active in the last 30 seconds</TooltipContent>
      </Tooltip>

      <div className="hidden lg:block">
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="flex cursor-help items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground text-xs" />
            }
          >
            <Activity className="size-3" />
            <MonoLabel
              className="tabular-nums"
              render={<span />}
              tone="inherit"
            >
              {stats?.totalSessions ?? 0}
            </MonoLabel>
            <span className="hidden sm:inline">visitors</span>
          </TooltipTrigger>
          <TooltipContent>Total unique sessions all-time</TooltipContent>
        </Tooltip>
      </div>

      <Button
        className={cn(
          "gap-1.5 text-xs",
          isOpen ? "bg-accent text-accent-foreground" : null
        )}
        onClick={toggle}
        size="sm"
        variant="ghost"
      >
        <MessageCircle className="size-3.5" />
        <MonoLabel
          className="hidden tabular-nums sm:inline"
          render={<span />}
          tone="inherit"
        >
          {recentComments?.length ?? 0}
        </MonoLabel>
        <span className="hidden lg:inline">
          {recentComments?.length === 1 ? "comment" : "comments"}
        </span>
      </Button>
    </div>
  );
};
