import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdjacentPosts, getPostBySlug } from "@/lib/posts";

export const Route = createFileRoute("/writing/$slug")({
	component: PostPage,
	loader: ({ params }) => {
		const post = getPostBySlug(params.slug);
		if (!post) {
			throw notFound();
		}
		const adjacent = getAdjacentPosts(params.slug);
		return { post, adjacent };
	},
});

function PostPage() {
	const { post, adjacent } = Route.useLoaderData();

	return (
		<div className="space-y-8">
			<Button asChild size="sm" variant="ghost">
				<Link to="/writing">
					<ArrowLeft className="size-4" />
					Back to writing
				</Link>
			</Button>

			<header className="space-y-4">
				<div className="flex flex-wrap items-center gap-3">
					<span className="text-muted-foreground text-sm">{post.date}</span>
					<span className="text-muted-foreground text-sm">
						· {post.readingTime}
					</span>
				</div>
				<h1 className="text-4xl tracking-tight md:text-5xl">{post.title}</h1>
				{Array.isArray(post.tags) && post.tags.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>
				) : null}
			</header>

			<Separator />

			<article
				className="prose"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is my own markdown
				dangerouslySetInnerHTML={{ __html: post.content }}
			/>

			<Separator />

			<nav className="flex items-center justify-between gap-4">
				{adjacent.prev ? (
					<Button asChild size="sm" variant="ghost">
						<Link params={{ slug: adjacent.prev.slug }} to="/writing/$slug">
							<ArrowLeft className="size-4" />
							<span className="line-clamp-1">{adjacent.prev.title}</span>
						</Link>
					</Button>
				) : (
					<div />
				)}
				{adjacent.next ? (
					<Button asChild size="sm" variant="ghost">
						<Link params={{ slug: adjacent.next.slug }} to="/writing/$slug">
							<span className="line-clamp-1">{adjacent.next.title}</span>
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				) : null}
			</nav>
		</div>
	);
}
