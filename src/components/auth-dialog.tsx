import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

export function AuthDialog() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: window.location.href,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});
			if (result.error) {
				setError(result.error.message ?? "Failed to sign in");
			} else {
				setOpen(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password,
			});
			if (result.error) {
				setError(result.error.message ?? "Failed to sign up");
			} else {
				setOpen(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign up");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<LogIn className="size-4" />
					Sign in to comment
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Welcome</DialogTitle>
					<DialogDescription>
						Sign in or create an account to join the conversation.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<Button
						className="w-full"
						disabled={isLoading}
						onClick={handleGoogleSignIn}
						variant="outline"
					>
						{isLoading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<svg
								aria-label="Google"
								className="size-4"
								role="img"
								viewBox="0 0 24 24"
							>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
						)}
						Continue with Google
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with email
							</span>
						</div>
					</div>

					<Tabs className="w-full" defaultValue="signin">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent className="space-y-4" value="signin">
							<form className="space-y-4" onSubmit={handleEmailSignIn}>
								<div className="space-y-2">
									<Label htmlFor="signin-email">Email</Label>
									<Input
										autoComplete="email"
										id="signin-email"
										name="email"
										placeholder="you@example.com"
										required
										type="email"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signin-password">Password</Label>
									<Input
										autoComplete="current-password"
										id="signin-password"
										minLength={8}
										name="password"
										required
										type="password"
									/>
								</div>
								<Button className="w-full" disabled={isLoading} type="submit">
									{isLoading ? (
										<Loader2 className="size-4 animate-spin" />
									) : null}
									Sign In
								</Button>
							</form>
						</TabsContent>

						<TabsContent className="space-y-4" value="signup">
							<form className="space-y-4" onSubmit={handleEmailSignUp}>
								<div className="space-y-2">
									<Label htmlFor="signup-name">Name</Label>
									<Input
										autoComplete="name"
										id="signup-name"
										name="name"
										placeholder="Your name"
										required
										type="text"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signup-email">Email</Label>
									<Input
										autoComplete="email"
										id="signup-email"
										name="email"
										placeholder="you@example.com"
										required
										type="email"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signup-password">Password</Label>
									<Input
										autoComplete="new-password"
										id="signup-password"
										minLength={8}
										name="password"
										placeholder="At least 8 characters"
										required
										type="password"
									/>
								</div>
								<Button className="w-full" disabled={isLoading} type="submit">
									{isLoading ? (
										<Loader2 className="size-4 animate-spin" />
									) : null}
									Create Account
								</Button>
							</form>
						</TabsContent>
					</Tabs>

					{error ? (
						<p className="text-center text-destructive text-sm">{error}</p>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
