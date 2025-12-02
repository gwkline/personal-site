import { Link, useRouterState } from "@tanstack/react-router";
import {
	Github,
	Linkedin,
	MailIcon,
	Menu,
	Moon,
	Send,
	Sun,
	TwitterIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LiveStatsNav } from "@/components/live-stats";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
	{ title: "Work", path: "/work" },
	{ title: "Posts", path: "/posts" },
	{ title: "About", path: "/about" },
	{ title: "Playground", path: "/playground" },
];

const contactLinks = [
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
		currentPath.startsWith("/posts/") && currentPath !== "/posts/";

	const { theme, setTheme } = useTheme();
	const readingProgress = useReadingProgress(isWritingPage);

	const isActive = (path: string) => {
		if (path === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(path);
	};

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div
				className="absolute right-0 bottom-0 left-0 h-px border-border bg-border"
				style={{
					maskImage:
						"linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
				}}
			/>
			<nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
				<div className="flex items-center gap-4 md:gap-8">
					<MobileNav currentPath={currentPath} isActive={isActive} />

					<Link
						className="font-semibold tracking-tight transition-colors hover:text-muted-foreground"
						to="/"
					>
						<img alt="Gavin Kline" height="auto" src="/logo.png" width={20} />
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
					<LiveStatsNav />

					<Separator className="mx-2 hidden sm:block" orientation="vertical" />

					<ContactPopover />

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

function MobileNav({
	currentPath,
	isActive,
}: {
	currentPath: string;
	isActive: (path: string) => boolean;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet onOpenChange={setOpen} open={open}>
			<SheetTrigger asChild>
				<Button className="md:hidden" size="icon-sm" variant="ghost">
					<Menu className="size-5" />
					<span className="sr-only">Open menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-72" side="left">
				<SheetHeader className="border-b pb-4">
					<SheetTitle className="flex items-center gap-2">
						<img alt="Gavin Kline" height="auto" src="/logo.png" width={20} />
						<span>Navigation</span>
					</SheetTitle>
				</SheetHeader>

				<nav className="flex flex-col gap-1 p-4">
					{navItems.map((item) => (
						<SheetClose asChild key={item.path}>
							<Link
								className={cn(
									"rounded-md px-3 py-2.5 font-medium text-sm transition-colors",
									isActive(item.path)
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
								)}
								to={item.path}
							>
								{item.title}
							</Link>
						</SheetClose>
					))}
				</nav>

				<Separator />

				<div className="p-4">
					<p className="mb-3 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Connect
					</p>
					<div className="flex flex-col gap-1">
						{contactLinks.map((link) => (
							<a
								className="flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
								href={link.href}
								key={link.title}
								rel="noopener noreferrer"
								target="_blank"
							>
								<link.icon className="size-4" />
								{link.title}
							</a>
						))}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function ContactPopover() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover onOpenChange={setIsOpen} open={isOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							className={isOpen ? "bg-accent text-accent-foreground" : ""}
							size="icon-sm"
							variant="ghost"
						>
							<Send className="size-4" />
							<span className="sr-only">Contact</span>
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent>Connect</TooltipContent>
			</Tooltip>

			<PopoverContent
				align="center"
				className="w-auto border-none bg-transparent p-0 shadow-none"
				sideOffset={-4}
			>
				<div className="relative flex items-center justify-center">
					{contactLinks.map((link, index) => {
						// Arrange in a semi-circle arc below the trigger
						const totalItems = contactLinks.length;
						const arcSpread = 120; // degrees of the arc
						const startAngle = 90 - arcSpread / 2; // center the arc at 90° (pointing down)
						const angleStep = arcSpread / (totalItems - 1);
						const angle = startAngle + index * angleStep;
						const radius = 55;
						// In screen coords: x right is positive, y down is positive
						const x = Math.cos((angle * Math.PI) / 180) * radius;
						const y = Math.sin((angle * Math.PI) / 180) * radius;

						return (
							<Tooltip key={link.title}>
								<TooltipTrigger asChild>
									<a
										className={cn(
											"absolute flex size-9 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-300 ease-out hover:scale-110 hover:bg-accent",
											isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
										)}
										href={link.href}
										rel="noopener noreferrer"
										style={{
											transform: isOpen
												? `translate(${x}px, ${y}px) scale(1)`
												: "translate(0, 0) scale(0)",
											transitionDelay: isOpen
												? `${index * 50}ms`
												: `${(totalItems - index - 1) * 30}ms`,
										}}
										target="_blank"
									>
										<link.icon className="size-4" />
										<span className="sr-only">{link.title}</span>
									</a>
								</TooltipTrigger>
								<TooltipContent side="bottom">{link.title}</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
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
