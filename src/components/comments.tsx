import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Reply,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { AuthDialog } from "@/components/auth-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface CommentsProps {
  postSlug?: string;
  title?: string;
  compact?: boolean;
}
interface CommentItemProps {
  comment: {
    _id: Id<"comments">;
    userId: string;
    userName: string;
    userImage?: string;
    content: string;
    createdAt: number;
    replyCount?: number;
    parentId?: Id<"comments">;
  };
  postSlug?: string;
  compact?: boolean;
  isReply?: boolean;
}
interface ReplyFormProps {
  parentId: Id<"comments">;
  postSlug?: string;
  compact?: boolean;
  onClose: () => void;
}
interface ReactionBarProps {
  commentId: Id<"comments">;
  compact?: boolean;
}
const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉", "🤔"] as const;
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
const handleSignOut = async () => {
  await authClient.signOut();
};
const ReactionBar = ({ commentId, compact }: ReactionBarProps) => {
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
  const hasReactions = reactions && reactions.length > 0;
  return (
    <div className="flex items-center gap-1">
      {/* Existing reactions */}
      {hasReactions &&
        reactions.map((data) => {
          const hasReacted = session?.user?.id
            ? data.userIds.includes(session.user.id)
            : false;
          return (
            <button
              className={cn(
                "flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 transition-colors",
                compact ? "text-[10px]" : "text-xs",
                hasReacted
                  ? "border-primary/50 bg-primary/10"
                  : "border-transparent bg-muted/50 hover:bg-muted",
                !session?.user && "cursor-default"
              )}
              disabled={!session?.user || isToggling === data.emoji}
              key={data.emoji}
              onClick={() => handleToggle(data.emoji)}
              type="button"
            >
              <span>{data.emoji}</span>
              <span className="font-mono text-muted-foreground">
                {data.count}
              </span>
            </button>
          );
        })}

      {/* Add reaction button */}
      {session?.user && (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                className={cn("size-6", compact && "size-5")}
                size="icon"
                variant="ghost"
              />
            }
          >
            <SmilePlus className={cn("size-3.5", compact && "size-3")} />
            <span className="sr-only">Add reaction</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  className="rounded p-1.5 text-lg transition-colors hover:bg-muted"
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
      )}
    </div>
  );
};
const ReplyForm = ({
  parentId,
  postSlug,
  compact,
  onClose,
}: ReplyFormProps) => {
  const addComment = useMutation(api.comments.add);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addComment({
        content: content.trim(),
        parentId,
        postSlug,
      });
      setContent("");
      onClose();
    } catch (error) {
      console.error("Failed to add reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Textarea
        autoFocus
        className={cn("resize-none", compact ? "min-h-12 text-xs" : "min-h-16")}
        disabled={isSubmitting}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        value={content}
      />
      <div className="flex gap-2">
        <Button
          disabled={!content.trim() || isSubmitting}
          size="sm"
          type="submit"
        >
          {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : null}
          Reply
        </Button>
        <Button onClick={onClose} size="sm" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
};
const CommentActions = ({
  commentId,
  compact,
  hasReplies,
  isReply,
  isSignedIn,
  replyCount,
  showReplies,
  onToggleReplies,
  onToggleReplyForm,
}: {
  commentId: Id<"comments">;
  compact: boolean;
  hasReplies: boolean;
  isReply: boolean;
  isSignedIn: boolean;
  replyCount: number;
  showReplies: boolean;
  onToggleReplies: () => void;
  onToggleReplyForm: () => void;
}) => (
  <div className="flex items-center gap-2 pt-1">
    <ReactionBar commentId={commentId} compact={compact} />
    {!isReply && isSignedIn ? (
      <Button
        className={cn("h-6 gap-1 px-2", compact ? "text-[10px]" : "text-xs")}
        onClick={onToggleReplyForm}
        size="sm"
        variant="ghost"
      >
        <Reply className="size-3" />
        Reply
      </Button>
    ) : null}
    {hasReplies && !isReply ? (
      <Button
        className={cn("h-6 gap-1 px-2", compact ? "text-[10px]" : "text-xs")}
        onClick={onToggleReplies}
        size="sm"
        variant="ghost"
      >
        {showReplies ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        )}
        {replyCount} {replyCount === 1 ? "reply" : "replies"}
      </Button>
    ) : null}
  </div>
);
const CommentDeleteButton = ({
  isDeleting,
  isOwner,
  onDelete,
}: {
  isDeleting: boolean;
  isOwner: boolean;
  onDelete: () => void;
}) => {
  if (!isOwner) {
    return null;
  }
  return (
    <Button
      className="opacity-0 transition-opacity group-hover:opacity-100"
      disabled={isDeleting}
      onClick={onDelete}
      size="icon-sm"
      variant="ghost"
    >
      {isDeleting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4 text-destructive" />
      )}
      <span className="sr-only">Delete comment</span>
    </Button>
  );
};
const getCommentStyles = (compact: boolean) => ({
  avatar: compact ? "size-7" : "size-9",
  container: compact ? "p-3" : "p-4",
  content: compact ? "text-xs" : "text-sm",
  fallback: compact ? "text-xs" : "",
  metadata: compact ? "text-[10px]" : "text-xs",
  name: compact ? "text-xs" : "text-sm",
});
const CommentItem = ({
  comment,
  postSlug,
  compact = false,
  isReply = false,
}: CommentItemProps) => {
  const { data: session } = authClient.useSession();
  const removeComment = useMutation(api.comments.remove);
  const replies = useQuery(
    api.comments.listReplies,
    comment.replyCount && comment.replyCount > 0
      ? { parentId: comment._id }
      : "skip"
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const handleDelete = async (commentId: Id<"comments">) => {
    setDeletingId(commentId);
    try {
      await removeComment({ commentId });
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setDeletingId(null);
    }
  };
  const hasReplies = (comment.replyCount ?? 0) > 0;
  const styles = getCommentStyles(compact);
  return (
    <article
      className={cn(
        "group rounded-lg border bg-card transition-all hover:bg-accent/50",
        styles.container,
        isReply && "ml-8 border-l-2 border-l-primary/20"
      )}
      id={`comment-${comment._id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar className={styles.avatar}>
            <AvatarImage alt={comment.userName} src={comment.userImage} />
            <AvatarFallback className={styles.fallback}>
              {getInitials(comment.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", styles.name)}>
                {comment.userName}
              </span>
              <span className={cn("text-muted-foreground", styles.metadata)}>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className={cn("leading-relaxed", styles.content)}>
              {comment.content}
            </p>

            <CommentActions
              commentId={comment._id}
              compact={compact}
              hasReplies={hasReplies}
              isReply={isReply}
              isSignedIn={Boolean(session?.user)}
              onToggleReplies={() => setShowReplies(!showReplies)}
              onToggleReplyForm={() => setShowReplyForm(!showReplyForm)}
              replyCount={comment.replyCount ?? 0}
              showReplies={showReplies}
            />
          </div>
        </div>

        <CommentDeleteButton
          isDeleting={deletingId === comment._id}
          isOwner={session?.user?.id === comment.userId}
          onDelete={() => handleDelete(comment._id)}
        />
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-12">
          <ReplyForm
            compact={compact}
            onClose={() => setShowReplyForm(false)}
            parentId={comment._id}
            postSlug={postSlug}
          />
        </div>
      )}

      {/* Replies */}
      {showReplies && replies && replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {replies.map((reply) => (
            <CommentItem
              comment={reply}
              compact={compact}
              isReply
              key={reply._id}
              postSlug={postSlug}
            />
          ))}
        </div>
      )}
    </article>
  );
};
export const Comments = ({
  postSlug,
  title = "Comments",
  compact = false,
}: CommentsProps) => {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const comments = useQuery(api.comments.list, { postSlug });
  const addComment = useMutation(api.comments.add);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addComment({ content: content.trim(), postSlug });
      setContent("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderAuthSection = () => {
    if (isSessionLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (session?.user) {
      return (
        <div className="space-y-4">
          {!compact && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage
                    alt={session.user.name ?? ""}
                    src={session.user.image ?? undefined}
                  />
                  <AvatarFallback>
                    {getInitials(
                      session.user.name ?? session.user.email ?? "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Signed in as{" "}
                  <strong>{session.user.name ?? session.user.email}</strong>
                </span>
              </div>
              <Button onClick={handleSignOut} size="sm" variant="ghost">
                Sign out
              </Button>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Textarea
              className={cn("resize-none", compact ? "min-h-16" : "min-h-24")}
              disabled={isSubmitting}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postSlug ? "Share your thoughts..." : "Leave a comment..."
              }
              value={content}
            />
            <Button
              className={compact ? "w-full" : "w-full sm:w-auto"}
              disabled={!content.trim() || isSubmitting}
              size={compact ? "sm" : "default"}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Post Comment
            </Button>
          </form>
        </div>
      );
    }
    return (
      <div
        className={cn(
          "rounded-lg border bg-muted/30 text-center",
          compact ? "p-4" : "p-6"
        )}
      >
        <p className="mb-4 text-muted-foreground text-sm">
          Join the conversation! Sign in to leave a comment.
        </p>
        <AuthDialog />
      </div>
    );
  };
  const renderCommentsList = () => {
    if (comments === undefined) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (comments.length === 0) {
      return (
        <p
          className={cn(
            "text-center text-muted-foreground",
            compact ? "py-4 text-sm" : "py-8"
          )}
        >
          No comments yet. Be the first to share your thoughts!
        </p>
      );
    }
    return comments.map((comment) => (
      <CommentItem
        comment={comment}
        compact={compact}
        key={comment._id}
        postSlug={postSlug}
      />
    ));
  };
  return (
    <section className={cn("space-y-6", compact && "space-y-4")}>
      {!compact && (
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5" />
          <h2 className="font-serif text-2xl">{title}</h2>
          {comments ? (
            <span className="text-muted-foreground text-sm">
              ({comments.length})
            </span>
          ) : null}
        </div>
      )}

      {renderAuthSection()}

      <div className={cn("space-y-4", compact && "space-y-3")}>
        {renderCommentsList()}
      </div>
    </section>
  );
};
