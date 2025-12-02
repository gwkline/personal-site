import { createFileRoute, Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPosts } from "@/lib/posts";

export const Route = createFileRoute("/writing/")({
	component: WritingPage,
	loader: () => ({ posts: getPosts() }),
});

function WritingPage() {
	const { posts } = Route.useLoaderData();

	return (
		<div className="space-y-12">
			<header className="space-y-4">
				<h1 className="text-4xl tracking-tight md:text-5xl">Writing</h1>
				<p className="max-w-xl text-lg text-muted-foreground">
					Thoughts on software, design, and the craft of building things.
				</p>
			</header>

			<Separator />

			<div className="space-y-1">
				{posts.map((post) => (
					<Link
						className="group -mx-3 flex items-baseline justify-between gap-4 rounded-md px-3 py-3 transition-colors hover:bg-muted/50"
						key={post.slug}
						params={{ slug: post.slug }}
						to="/writing/$slug"
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
						<span className="shrink-0 text-muted-foreground text-sm">
							{post.date}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
