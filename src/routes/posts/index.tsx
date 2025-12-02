import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/posts";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/posts/")({
	component: WritingPage,
	loader: () => ({ posts: getPosts() }),
});

function WritingPage() {
	const { posts } = Route.useLoaderData();
	const postSlugs = posts.map((p) => p.slug);
	const commentCounts = useQuery(api.comments.countByPosts, { postSlugs });

	return (
		<div className="space-y-12">
			<PageHeader
				description="Thoughts on software, design, and the craft of building things."
				title="Posts"
			/>

			<div className="space-y-1">
				{posts.map((post) => {
					const count = commentCounts?.[post.slug] ?? 0;
					return (
						<Link
							className="group -mx-3 flex items-baseline justify-between gap-4 rounded-md px-3 py-3 transition-colors hover:bg-muted/50"
							key={post.slug}
							params={{ slug: post.slug }}
							to="/posts/$slug"
						>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-medium">{post.title}</span>
									{post.tags?.map((tag) => (
										<Badge className="text-xs" key={tag} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
								<p className="line-clamp-1 text-muted-foreground text-sm">
									{post.description}
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
								{count > 0 && (
									<span className="flex items-center gap-1">
										<MessageCircle className="size-3.5" />
										{count}
									</span>
								)}
								<span>{post.date}</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
