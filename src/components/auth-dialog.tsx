import { Loader2, LockKeyhole, LogIn } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export const AuthDialog = ({
  description = "Sign in or create an account to join the conversation.",
  title = "Welcome",
  triggerLabel = "Sign in to comment",
}: {
  description?: string;
  title?: string;
  triggerLabel?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (signInError) {
      setError(
        signInError instanceof Error ? signInError.message : "Failed to sign in"
      );
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
    } catch (signInError) {
      setError(
        signInError instanceof Error ? signInError.message : "Failed to sign in"
      );
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
        email,
        name,
        password,
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to sign up");
      } else {
        setOpen(false);
      }
    } catch (signUpError) {
      setError(
        signUpError instanceof Error ? signUpError.message : "Failed to sign up"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError(null);
        }
      }}
      open={open}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <LogIn className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="gap-5 overflow-hidden p-0 shadow-elevation-2 sm:max-w-md">
        <DialogHeader className="border-b bg-muted/45 px-6 pt-6 pb-5">
          <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-info/12 text-info ring-1 ring-info/18">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle className="font-heading text-2xl font-semibold tracking-[-0.035em]">
            {title}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
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

          <div aria-hidden="true" className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-popover px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <Tabs className="w-full" defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 bg-surface-sunken">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="signin">
              <form className="space-y-4" onSubmit={handleEmailSignIn}>
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    aria-invalid={Boolean(error)}
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
                    aria-invalid={Boolean(error)}
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
                    aria-invalid={Boolean(error)}
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
                    aria-invalid={Boolean(error)}
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
                    aria-invalid={Boolean(error)}
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
            <Card size="sm" variant="sunken">
              <CardContent>
                <p
                  aria-live="polite"
                  className="text-destructive text-sm leading-relaxed"
                  role="alert"
                >
                  {error}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
