import { Link, useRouterState } from "@tanstack/react-router";
import {
	Github,
	Linkedin,
	MailIcon,
	Moon,
	Sun,
	TwitterIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
	{ title: "Home", path: "/" },
	{ title: "Work", path: "/work" },
	{ title: "Writing", path: "/writing" },
	{ title: "About", path: "/about" },
	{ title: "Playground", path: "/playground" },
];

const externalLinks = [
	{
		title: "GitHub",
		href: "https://github.com/gwkline",
		icon: Github,
	},
	{
		title: "Twitter",
		href: "https://x.com/washedkline",
		icon: TwitterIcon,
	},
	{
		title: "LinkedIn",
		href: "https://linkedin.com/in/gavinkline",
		icon: Linkedin,
	},
	{
		title: "Email",
		href: "mailto:hello@gavinkline.com",
		icon: MailIcon,
	},
];

export function Navbar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const isWritingPage =
		currentPath.startsWith("/writing/") && currentPath !== "/writing/";

	const { theme, setTheme } = useTheme();
	const readingProgress = useReadingProgress(isWritingPage);

	const isActive = (path: string) => {
		if (path === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(path);
	};

	return (
		<header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
			<nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
				<div className="flex items-center gap-8">
					<Link
						className="font-semibold tracking-tight transition-colors hover:text-muted-foreground"
						to="/"
					>
						GK
					</Link>

					<ul className="hidden items-center gap-1 md:flex">
						{navItems.map((item) => (
							<li key={item.path}>
								<Link
									className={cn(
										"rounded-md px-3 py-2 text-sm transition-colors",
										isActive(item.path)
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									)}
									to={item.path}
								>
									{item.title}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div className="flex items-center gap-1">
					{externalLinks.map((link) => (
						<Tooltip key={link.title}>
							<TooltipTrigger asChild>
								<Button asChild size="icon-sm" variant="ghost">
									<a href={link.href} rel="noopener noreferrer" target="_blank">
										<link.icon className="size-4" />
										<span className="sr-only">{link.title}</span>
									</a>
								</Button>
							</TooltipTrigger>
							<TooltipContent>{link.title}</TooltipContent>
						</Tooltip>
					))}

					<Separator className="mx-2" orientation="vertical" />

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={() => {
									setTheme(theme === "light" ? "dark" : "light");
								}}
								size="icon-sm"
								variant="ghost"
							>
								{theme === "light" ? <Moon /> : <Sun />}
								<span className="sr-only">Toggle theme</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{theme === "light" ? "Dark mode" : "Light mode"}
						</TooltipContent>
					</Tooltip>
				</div>
			</nav>
			<div className="relative h-px w-full bg-border">
				{isWritingPage ? (
					<div
						className="absolute inset-y-0 left-0 bg-orange-500 transition-[width] duration-100 ease-out"
						style={{ width: `${readingProgress}%` }}
					/>
				) : null}
			</div>
		</header>
	);
}
function useReadingProgress(enabled: boolean) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (!enabled) {
			setProgress(0);
			return;
		}

		const updateProgress = () => {
			const scrollable =
				document.documentElement.scrollHeight - window.innerHeight;
			if (scrollable <= 0) {
				setProgress(0);
				return;
			}
			setProgress((window.scrollY / scrollable) * 100);
		};

		updateProgress();
		window.addEventListener("scroll", updateProgress, { passive: true });

		return () => window.removeEventListener("scroll", updateProgress);
	}, [enabled]);

	return progress;
}
