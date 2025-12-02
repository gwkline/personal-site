import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import {
	Activity,
	ChevronDown,
	ChevronUp,
	GripVertical,
	Loader2,
	MessageCircle,
	Reply,
	SmilePlus,
	Trash2,
	X,
} from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { AuthDialog } from "@/components/auth-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const REACTION_EMOJIS = ["👍", "👎", "❤️", "🔥", "😂", "🎉", "🤔"] as const;
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 400;

const getInitials = (name: string) =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

type SidebarContextValue = {
	isOpen: boolean;
	width: number;
	setWidth: (width: number) => void;
	toggle: () => void;
	close: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useCommentSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}

export function CommentSidebarProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [width, setWidth] = useState(DEFAULT_WIDTH);

	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
	const close = useCallback(() => setIsOpen(false), []);

	return (
		<SidebarContext.Provider value={{ isOpen, width, setWidth, toggle, close }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function LiveStatsNav() {
	const stats = useQuery(api.presence.getStats);
	const recentComments = useQuery(api.comments.listRecent, { limit: 5 });
	const { toggle, isOpen } = useCommentSidebar();

	usePresence();

	return (
		<div className="flex items-center gap-1">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex cursor-help items-center gap-1.5 rounded-md px-2 py-1 text-xs">
						<span className="relative flex size-2">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-2 opacity-75" />
							<span className="relative inline-flex size-2 rounded-full bg-chart-2" />
						</span>
						<span className="font-mono tabular-nums">
							{stats?.activeUsers ?? 0}
						</span>
						<span className="hidden text-muted-foreground sm:inline">
							online
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>Users active in the last 30 seconds</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex cursor-help items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground text-xs">
						<Activity className="size-3" />
						<span className="font-mono tabular-nums">
							{stats?.totalSessions ?? 0}
						</span>
						<span className="hidden sm:inline">visitors</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>Total unique sessions all-time</TooltipContent>
			</Tooltip>

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
				<span className="font-mono tabular-nums">
					{recentComments?.length ?? 0}
				</span>
				<span className="hidden sm:inline">
					{recentComments?.length !== 1 ? "comments" : "comment"}
				</span>
			</Button>
		</div>
	);
}

export function CommentsSidebar() {
	const allComments = useQuery(api.comments.listRecent, { limit: 30 });
	const { isOpen, close, width, setWidth } = useCommentSidebar();
	const { data: session } = authClient.useSession();
	const isResizing = useRef(false);

	const formatPostSlug = (slug: string) =>
		slug
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isResizing.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing.current) {
				return;
			}
			const newWidth = window.innerWidth - e.clientX;
			setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
		};

		const handleMouseUp = () => {
			isResizing.current = false;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [setWidth]);

	return (
		<aside
			className={cn(
				"fixed top-14 right-0 z-40 h-[calc(100vh-3.5rem)] border-l bg-background transition-transform duration-300 ease-in-out",
				isOpen ? "translate-x-0" : "translate-x-full"
			)}
			style={{ width }}
		>
			{/* Resize Handle */}
			<button
				aria-label="Resize sidebar"
				className="-left-1.5 absolute top-0 z-50 flex h-full w-3 cursor-col-resize items-center justify-center"
				onMouseDown={handleMouseDown}
				type="button"
			>
				<span className="flex h-10 w-3 items-center justify-center rounded-full border bg-muted shadow-sm">
					<GripVertical className="size-3 text-muted-foreground" />
				</span>
			</button>

			<div className="flex h-full flex-col">
				{/* Header */}
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div className="flex items-center gap-2">
						<MessageCircle className="size-4" />
						<h2 className="font-medium text-sm">Activity Feed</h2>
					</div>
					<Button onClick={close} size="icon-sm" variant="ghost">
						<X className="size-4" />
						<span className="sr-only">Close</span>
					</Button>
				</div>

				{/* Unified Comments Feed */}
				<div className="flex-1 overflow-y-auto p-4">
					{!allComments || allComments.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<MessageCircle className="mb-3 size-8 text-muted-foreground/50" />
							<p className="mb-1 text-muted-foreground text-sm">
								No comments yet
							</p>
							<p className="text-muted-foreground text-xs">
								Be the first to join the conversation!
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{allComments.map((comment) => (
								<SidebarCommentItem
									comment={comment}
									formatPostSlug={formatPostSlug}
									key={comment._id}
									onClose={close}
								/>
							))}
						</div>
					)}
				</div>

				{/* Comment Form */}
				<div className="border-t p-4">
					{session?.user ? (
						<GlobalCommentForm />
					) : (
						<div className="space-y-2 text-center">
							<p className="text-muted-foreground text-xs">
								Sign in to join the conversation
							</p>
							<AuthDialog />
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}

function GlobalCommentForm() {
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
			await addComment({ content: content.trim() });
			setContent("");
		} catch (err) {
			console.error("Failed to add comment:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="space-y-2" onSubmit={handleSubmit}>
			<Textarea
				className="min-h-16 resize-none text-sm"
				disabled={isSubmitting}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Leave a comment..."
				value={content}
			/>
			<Button
				className="w-full"
				disabled={!content.trim() || isSubmitting}
				size="sm"
				type="submit"
			>
				{isSubmitting ? <Loader2 className="size-3 animate-spin" /> : null}
				Post Comment
			</Button>
		</form>
	);
}

function SidebarCommentItem({
	comment,
	formatPostSlug,
	onClose,
}: {
	comment: {
		_id: Id<"comments">;
		postSlug?: string;
		userId: string;
		userName: string;
		userImage?: string;
		content: string;
		createdAt: number;
		replyCount?: number;
	};
	formatPostSlug: (slug: string) => string;
	onClose: () => void;
}) {
	const { data: session } = authClient.useSession();
	const removeComment = useMutation(api.comments.remove);
	const navigate = useNavigate();
	const hasReplies = (comment.replyCount ?? 0) > 0;
	const replies = useQuery(
		api.comments.listReplies,
		hasReplies ? { parentId: comment._id } : "skip"
	);

	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showReplies, setShowReplies] = useState(false);
	const [showReplyForm, setShowReplyForm] = useState(false);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setDeletingId(comment._id);
		try {
			await removeComment({ commentId: comment._id });
		} catch (err) {
			console.error("Failed to delete comment:", err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleClick = () => {
		onClose();
		const path = comment.postSlug ? `/posts/${comment.postSlug}` : "/";
		navigate({ to: path }).then(() => {
			setTimeout(() => {
				const element = document.getElementById(`comment-${comment._id}`);
				if (element) {
					element.scrollIntoView({ behavior: "smooth", block: "center" });
					element.classList.add("ring-2", "ring-primary", "ring-offset-2");
					setTimeout(() => {
						element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
					}, 2000);
				}
			}, 100);
		});
	};

	const canReply = Boolean(session?.user);
	const repliesArray = Array.isArray(replies) ? replies : [];
	const shouldShowReplies = showReplies && repliesArray.length > 0;
	const locationLabel = comment.postSlug
		? `on "${formatPostSlug(comment.postSlug)}"`
		: "in Guestbook";

	return (
		<div className="group w-full rounded-lg border bg-card text-left transition-colors hover:border-foreground/20 hover:bg-accent/50">
			<button
				className="flex w-full cursor-pointer items-start gap-2 p-3 text-left"
				onClick={handleClick}
				type="button"
			>
				<Avatar className="size-7 shrink-0">
					<AvatarImage alt={comment.userName} src={comment.userImage} />
					<AvatarFallback className="text-xs">
						{getInitials(comment.userName)}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<span className="flex min-w-0 items-center gap-1.5">
							<span className="truncate font-medium text-xs">
								{comment.userName}
							</span>
							<span className="shrink-0 text-[10px] text-muted-foreground">
								{formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
								})}
							</span>
						</span>
						<SidebarDeleteButton
							isDeleting={deletingId === comment._id}
							isOwner={session?.user?.id === comment.userId}
							onDelete={handleDelete}
						/>
					</div>
					<p className="mt-1 text-left text-sm leading-relaxed">
						{comment.content}
					</p>
					<span className="mt-1.5 block text-left text-primary/80 text-xs">
						{locationLabel}
					</span>
				</div>
			</button>

			<SidebarCommentActions
				canReply={canReply}
				commentId={comment._id}
				hasReplies={hasReplies}
				replyCount={comment.replyCount ?? 0}
				setShowReplies={setShowReplies}
				setShowReplyForm={setShowReplyForm}
				showReplies={showReplies}
				showReplyForm={showReplyForm}
			/>

			{showReplyForm ? (
				<div className="px-3 pb-3 pl-12">
					<SidebarReplyForm
						onClose={() => setShowReplyForm(false)}
						parentId={comment._id}
					/>
				</div>
			) : null}

			{shouldShowReplies ? (
				<div className="space-y-2 px-3 pb-3 pl-12">
					{repliesArray.map((reply) => (
						<SidebarReplyItem key={reply._id} reply={reply} />
					))}
				</div>
			) : null}
		</div>
	);
}

function SidebarDeleteButton({
	isOwner,
	isDeleting,
	onDelete,
}: {
	isOwner: boolean;
	isDeleting: boolean;
	onDelete: (e: React.MouseEvent) => void;
}) {
	if (!isOwner) {
		return null;
	}
	return (
		<Button
			className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
			disabled={isDeleting}
			onClick={onDelete}
			size="icon"
			variant="ghost"
		>
			{isDeleting ? (
				<Loader2 className="size-3 animate-spin" />
			) : (
				<Trash2 className="size-3 text-destructive" />
			)}
			<span className="sr-only">Delete</span>
		</Button>
	);
}

function SidebarCommentActions({
	commentId,
	canReply,
	hasReplies,
	replyCount,
	showReplyForm,
	showReplies,
	setShowReplyForm,
	setShowReplies,
}: {
	commentId: Id<"comments">;
	canReply: boolean;
	hasReplies: boolean;
	replyCount: number;
	showReplyForm: boolean;
	showReplies: boolean;
	setShowReplyForm: (show: boolean) => void;
	setShowReplies: (show: boolean) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1 px-3 pb-3 pl-12">
			<SidebarReactionBar commentId={commentId} />
			{canReply ? (
				<Button
					className="h-5 gap-1 px-1.5 text-[10px]"
					onClick={() => setShowReplyForm(!showReplyForm)}
					size="sm"
					variant="ghost"
				>
					<Reply className="size-2.5" />
					Reply
				</Button>
			) : null}
			{hasReplies ? (
				<Button
					className="h-5 gap-1 px-1.5 text-[10px]"
					onClick={() => setShowReplies(!showReplies)}
					size="sm"
					variant="ghost"
				>
					{showReplies ? (
						<ChevronUp className="size-2.5" />
					) : (
						<ChevronDown className="size-2.5" />
					)}
					{replyCount} {replyCount === 1 ? "reply" : "replies"}
				</Button>
			) : null}
		</div>
	);
}

function SidebarReplyItem({
	reply,
}: {
	reply: {
		_id: Id<"comments">;
		userId: string;
		userName: string;
		userImage?: string;
		content: string;
		createdAt: number;
	};
}) {
	const { data: session } = authClient.useSession();
	const removeComment = useMutation(api.comments.remove);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await removeComment({ commentId: reply._id });
		} catch (err) {
			console.error("Failed to delete reply:", err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="group flex items-start gap-2 rounded border-l-2 border-l-primary/20 bg-muted/30 p-2">
			<Avatar className="size-5 shrink-0">
				<AvatarImage alt={reply.userName} src={reply.userImage} />
				<AvatarFallback className="text-[8px]">
					{getInitials(reply.userName)}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1">
					<span className="truncate font-medium text-[10px]">
						{reply.userName}
					</span>
					<span className="text-[9px] text-muted-foreground">
						{formatDistanceToNow(new Date(reply.createdAt), {
							addSuffix: true,
						})}
					</span>
				</div>
				<p className="text-xs leading-relaxed">{reply.content}</p>
				<div className="pt-1">
					<SidebarReactionBar commentId={reply._id} />
				</div>
			</div>
			{session?.user?.id === reply.userId && (
				<Button
					className="size-5 opacity-0 transition-opacity group-hover:opacity-100"
					disabled={isDeleting}
					onClick={handleDelete}
					size="icon"
					variant="ghost"
				>
					{isDeleting ? (
						<Loader2 className="size-2.5 animate-spin" />
					) : (
						<Trash2 className="size-2.5 text-destructive" />
					)}
					<span className="sr-only">Delete</span>
				</Button>
			)}
		</div>
	);
}

function SidebarReplyForm({
	parentId,
	onClose,
}: {
	parentId: Id<"comments">;
	onClose: () => void;
}) {
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
			});
			setContent("");
			onClose();
		} catch (err) {
			console.error("Failed to add reply:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="space-y-1.5" onSubmit={handleSubmit}>
			<Textarea
				autoFocus
				className="min-h-10 resize-none text-xs"
				disabled={isSubmitting}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Write a reply..."
				value={content}
			/>
			<div className="flex gap-1.5">
				<Button
					className="h-6 text-[10px]"
					disabled={!content.trim() || isSubmitting}
					size="sm"
					type="submit"
				>
					{isSubmitting ? <Loader2 className="size-2.5 animate-spin" /> : null}
					Reply
				</Button>
				<Button
					className="h-6 text-[10px]"
					onClick={onClose}
					size="sm"
					type="button"
					variant="ghost"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

function SidebarReactionBar({ commentId }: { commentId: Id<"comments"> }) {
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
		} catch (err) {
			console.error("Failed to toggle reaction:", err);
		} finally {
			setIsToggling(null);
		}
	};

	const hasReactions = reactions && reactions.length > 0;

	return (
		<div className="flex items-center gap-0.5">
			{/* Existing reactions */}
			{hasReactions
				? reactions.map((data) => {
						const hasReacted = session?.user?.id
							? data.userIds.includes(session.user.id)
							: false;

						return (
							<button
								className={cn(
									"flex items-center gap-0.5 rounded-full border px-1 py-0.5 text-[10px] transition-colors",
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
								<span className="text-xs">{data.emoji}</span>
								<span className="font-mono text-muted-foreground">
									{data.count}
								</span>
							</button>
						);
					})
				: null}

			{/* Add reaction button */}
			{session?.user ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button className="size-5" size="icon" variant="ghost">
							<SmilePlus className="size-3" />
							<span className="sr-only">Add reaction</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-1.5" side="top">
						<div className="flex gap-0.5">
							{REACTION_EMOJIS.map((emoji) => (
								<button
									className="rounded p-1 text-base transition-colors hover:bg-muted"
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
}

function usePresence() {
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
}

function generateSessionId() {
	const stored = localStorage.getItem("session-id");
	if (stored) {
		return stored;
	}
	const id = crypto.randomUUID();
	localStorage.setItem("session-id", id);
	return id;
}
