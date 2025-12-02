import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	return (
		<div className="space-y-12">
			<header className="space-y-4">
				<h1 className="text-4xl tracking-tight md:text-5xl">About</h1>
			</header>

			<div className="prose max-w-none">
				<p className="text-lg text-muted-foreground">
					I'm a software engineer who cares deeply about the craft of building
					products that matter.
				</p>

				<h2>Background</h2>
				<p>
					I graduated from Syracuse University with a B.S. in Computer Science
					in three academic years while playing on the Division 1 Men's Lacrosse
					team - the second winningest program in NCAA history. Since then, I've
					spent my career working across the stack, from building
					high-performance backend systems to crafting polished user interfaces.
				</p>
				<p>
					Currently, I'm working at GovDash, where I serve as lead founding
					software engineer and product owner of Capture Cloud - our largest and
					fastest-growing product line. Previously, I built marketplace
					infrastructure at Whop (supporting 1M+ MAU), led engineering at
					Gorjian Acquisitions, and developed mission-critical software at CACI
					Inc for the PM IVAS program.
				</p>

				<h2>What I do</h2>
				<p>
					I specialize in backend development, database design, and application
					performance optimization. I've driven millions of dollars in revenue
					through the features I've shipped and the optimizations I've
					implemented. While I often serve in managerial or leadership
					positions, I still see myself primarily as an individual contributor
					at heart - I thrive on hands-on engineering, and consistently serve as
					the top code contributor and lead reviewer on my teams.
				</p>

				<h2>Tech</h2>
				<div className="not-prose flex flex-wrap gap-2">
					{[
						"Go",
						"TypeScript",
						"PostgreSQL",
						"React",
						"Python",
						"Ruby on Rails",
						"GraphQL",
						"Redis",
						"Docker",
						"Node.js",
					].map((skill) => (
						<Badge key={skill} variant="secondary">
							{skill}
						</Badge>
					))}
				</div>
			</div>

			<Separator />

			<section className="space-y-4">
				<h2 className="text-xl">Get in touch</h2>
				<div className="flex flex-wrap gap-3">
					<Button asChild variant="outline">
						<a href="mailto:hello@gavinkline.com">
							<Mail className="size-4" />
							Email me
						</a>
					</Button>
					<Button asChild variant="outline">
						<a download href="/resume.pdf">
							<Download className="size-4" />
							Download resume
						</a>
					</Button>
				</div>
			</section>
		</div>
	);
}
