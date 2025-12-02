import { Separator } from "@/components/ui/separator";

export function PageHeader({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	return (
		<>
			<header className="space-y-4">
				<h1 className="text-4xl tracking-tight md:text-5xl">{title}</h1>
				<p className="text-lg text-muted-foreground">{description}</p>
				{children}
			</header>
			<Separator />
		</>
	);
}
