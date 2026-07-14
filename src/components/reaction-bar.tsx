import { useMutation, useQuery } from "convex/react";
import { SmilePlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const REACTION_EMOJIS = ["👍", "👎", "❤️", "🔥", "😂", "🎉", "🤔"] as const;

export const ReactionBar = ({
  commentId,
  compact = false,
}: {
  commentId: Id<"comments">;
  compact?: boolean;
}) => {
  const { data: session } = authClient.useSession();
  const reactions = useQuery(api.comments.getReactions, { commentId });
  const toggleReaction = useMutation(api.comments.toggleReaction);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleToggle = async (emoji: string) => {
    if (!session?.user || isToggling) {
      return;
    }
    setIsToggling(emoji);
    try {
      await toggleReaction({ commentId, emoji });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-1")}>
      {reactions?.map((reaction) => {
        const hasReacted = session?.user?.id
          ? reaction.userIds.includes(session.user.id)
          : false;
        return (
          <button
            className={cn(
              "flex items-center gap-0.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              compact ? "px-1 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-xs",
              hasReacted
                ? "border-primary/30 bg-primary/12 text-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              !session?.user && "cursor-default"
            )}
            disabled={!session?.user || isToggling === reaction.emoji}
            key={reaction.emoji}
            onClick={() => handleToggle(reaction.emoji)}
            type="button"
          >
            <span>{reaction.emoji}</span>
            <span className="font-mono text-muted-foreground">
              {reaction.count}
            </span>
          </button>
        );
      })}

      {session?.user ? (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                className={compact ? "size-5" : "size-6"}
                size="icon"
                variant="ghost"
              />
            }
          >
            <SmilePlus className={compact ? "size-3" : "size-3.5"} />
            <span className="sr-only">Add reaction</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  className="rounded-md p-1.5 text-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                  disabled={isToggling === emoji}
                  key={emoji}
                  onClick={() => handleToggle(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
};
