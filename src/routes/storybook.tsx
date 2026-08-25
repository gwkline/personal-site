import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CircleAlert,
  Info,
  Palette,
  Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Eyebrow, PageHeader } from "@/components/page-header";
import {
  StorySection,
  Variant,
  VariantGrid,
} from "@/components/storybook/story";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Grid } from "@/components/ui/grid";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { MonoLabel } from "@/components/ui/mono-label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { SectionHeader } from "@/components/ui/section-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Stat } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const sections = [
  { id: "buttons", label: "Button" },
  { id: "badges", label: "Badge" },
  { id: "cards", label: "Card" },
  { id: "forms", label: "Input" },
  { id: "alerts", label: "Alert" },
  { id: "stats", label: "Stat" },
  { id: "headers", label: "Headers" },
  { id: "tabs", label: "Tabs" },
  { id: "feedback", label: "Feedback" },
  { id: "identity", label: "Identity" },
  { id: "layout", label: "Layout" },
  { id: "micro-type", label: "Micro-type" },
  { id: "tokens", label: "Tokens" },
];

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const badgeVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "info",
  "success",
  "destructive",
  "link",
] as const;

const cardVariants = [
  "default",
  "glass",
  "interactive",
  "muted",
  "sunken",
] as const;

const cardIntents: Record<(typeof cardVariants)[number], string> = {
  default: "Baseline surface. Elevation 1.",
  glass: "Translucent (78%) with backdrop blur. For sitting on imagery.",
  interactive: "default + hover lift and primary ring.",
  muted: "45% muted tint. Quiet secondary content.",
  sunken: "Pressed-in well. Opaque, darker, inner shadow.",
};

const cardDemos: {
  elevated?: boolean;
  intent: string;
  name: string;
}[] = [
  ...cardVariants.map((name) => ({ intent: cardIntents[name], name })),
  {
    elevated: true,
    intent:
      "Emphasis layer over any surface: larger radius, primary ring, elevation 2.",
    name: "default + elevated",
  },
];

const colorTokens = [
  "--background",
  "--card",
  "--popover",
  "--primary",
  "--secondary",
  "--muted",
  "--accent",
  "--destructive",
  "--info",
  "--success",
  "--warning",
  "--border",
  "--input",
  "--ring",
  "--surface-raised",
  "--surface-sunken",
] as const;

const brandTokens = [
  { name: "hero-night", note: "hero background" },
  { name: "hero-deep", note: "hero overlay" },
  { name: "hero-navy", note: "" },
  { name: "hero-blue", note: "" },
  { name: "hero-sand", note: "hero text" },
  { name: "hero-mist", note: "" },
  { name: "hero-haze", note: "" },
  { name: "hero-glow", note: "brand orange" },
  { name: "hero-ember", note: "" },
  { name: "hero-light", note: "" },
  { name: "depths-abyss", note: "HUD background" },
  { name: "depths-cave", note: "" },
  { name: "depths-panel", note: "" },
  { name: "depths-stone", note: "" },
  { name: "depths-shard", note: "" },
  { name: "depths-glow", note: "" },
  { name: "depths-parchment", note: "HUD text" },
  { name: "depths-bone", note: "" },
  { name: "depths-lilac", note: "HUD muted" },
  { name: "depths-mauve", note: "" },
  { name: "depths-slate", note: "" },
  { name: "lab-night", note: "visual backdrop" },
  { name: "lab-cream", note: "" },
  { name: "lab-flame", note: "accent" },
  { name: "lab-amber", note: "accent" },
  { name: "lab-gold", note: "accent" },
  { name: "art-panel", note: "graphic frame" },
] as const;

const EyebrowShowcase = () => (
  <div className="flex flex-wrap items-center gap-6">
    <Eyebrow>Eyebrow label</Eyebrow>
    <span className="font-heading text-2xl font-semibold tracking-[-0.035em]">
      Heading font
    </span>
    <span className="font-mono text-sm">Mono body 0123456789</span>
    <span className="text-sm">Sans body — the quick brown fox.</span>
  </div>
);

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-14 items-center justify-center rounded-lg border bg-surface-sunken/60 p-3 text-muted-foreground text-xs">
    {children}
  </div>
);

const useActiveSection = (ids: readonly string[]) => {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const container = document.querySelector("#app-scroll-container");
    if (!container) {
      return;
    }
    // Sections rest at scroll-mt-32 (128px) when scrolled to; the reading
    // line must sit below that or the active pill lags one section behind.
    const line = 140;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const element = document.querySelector(`#${id}`);
        if (element && element.getBoundingClientRect().top <= line) {
          current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [ids]);
  return active;
};

const sectionIds = sections.map((section) => section.id);

const StorybookPage = () => {
  const activeSection = useActiveSection(sectionIds);
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHeader
        action={<Badge variant="info">Design system</Badge>}
        description="Living gallery of site components. Tune the source, watch it land here."
        eyebrow="Component lab"
        title="Storybook"
      />

      <nav className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-1.5 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        {sections.map((section) => (
          <a
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
              activeSection === section.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
            href={`#${section.id}`}
            key={section.id}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <StorySection
        description="Six intents across five sizes. Hover and press states carry the elevation language."
        id="buttons"
        name="Button"
      >
        <VariantGrid>
          {buttonVariants.map((variant) => (
            <Variant key={variant} label={variant}>
              <Button variant={variant}>Deploy</Button>
              <Button variant={variant}>
                <ArrowRight data-icon="inline-end" />
                Continue
              </Button>
            </Variant>
          ))}
        </VariantGrid>
        <Separator />
        <VariantGrid>
          <Variant label="xs">
            <Button size="xs">Extra small</Button>
          </Variant>
          <Variant label="sm">
            <Button size="sm">Small</Button>
          </Variant>
          <Variant label="default">
            <Button>Default</Button>
          </Variant>
          <Variant label="lg">
            <Button size="lg">Large</Button>
          </Variant>
          <Variant label="icon">
            <Button size="icon">
              <Rocket />
            </Button>
            <Button size="icon-sm" variant="outline">
              <Bell />
            </Button>
            <Button size="icon-xs" variant="ghost">
              <Info />
            </Button>
          </Variant>
          <Variant label="states">
            <Button disabled>Disabled</Button>
            <Button disabled variant="outline">
              <Spinner />
              Saving
            </Button>
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Status pills in two sizes. Ghost and link variants inherit interactive affordances."
        id="badges"
        name="Badge"
      >
        <VariantGrid>
          <Variant label="default size">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </Variant>
          <Variant label="sm">
            {badgeVariants.map((variant) => (
              <Badge key={variant} size="sm" variant={variant}>
                {variant}
              </Badge>
            ))}
          </Variant>
          <Variant label="with icon">
            <Badge variant="success">
              <CircleAlert />
              Passing
            </Badge>
            <Badge variant="destructive">
              <CircleAlert />
              Failing
            </Badge>
            <Badge variant="info">
              <Info />
              Beta
            </Badge>
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Surface treatments over one vivid strip. Glass and muted are translucent; sunken is a pressed-in well; elevated is an emphasis layer that stacks on any surface."
        id="cards"
        name="Card"
      >
        <div className="relative overflow-hidden rounded-xl border">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(115deg, var(--color-hero-glow), var(--color-hero-ember) 28%, var(--color-depths-lilac) 62%, var(--color-hero-blue))",
            }}
          />
          <div className="relative grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
            {cardDemos.map((demo) => (
              <div className="flex flex-col gap-2" key={demo.name}>
                <Card elevated={demo.elevated}>
                  <CardHeader>
                    <CardTitle>{demo.name}</CardTitle>
                    <CardDescription>
                      The quick brown fox jumps over the lazy dog.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Body copy sits here so you can judge contrast against each
                    surface.
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline">
                      Action
                    </Button>
                  </CardFooter>
                </Card>
                <p className="w-fit rounded-md bg-background/85 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                  {demo.intent}
                </p>
              </div>
            ))}
          </div>
        </div>
      </StorySection>

      <StorySection
        description="Field anatomy: labels, placeholders, disabled, and invalid rings."
        id="forms"
        name="Input"
      >
        <VariantGrid className="lg:grid-cols-2">
          <Variant className="w-full max-w-sm flex-col" label="default">
            <Label htmlFor="story-email">Email</Label>
            <Input
              id="story-email"
              placeholder="you@example.com"
              type="email"
            />
          </Variant>
          <Variant className="w-full max-w-sm flex-col" label="filled">
            <Label htmlFor="story-name">Display name</Label>
            <Input id="story-name" defaultValue="gavin" />
          </Variant>
          <Variant className="w-full max-w-sm flex-col" label="disabled">
            <Label htmlFor="story-disabled">API key</Label>
            <Input
              defaultValue="sk-live-••••••••"
              disabled
              id="story-disabled"
            />
          </Variant>
          <Variant className="w-full max-w-sm flex-col" label="invalid">
            <Label htmlFor="story-invalid">Workspace</Label>
            <Input aria-invalid defaultValue="bad name!" id="story-invalid" />
          </Variant>
          <Variant
            className="w-full max-w-sm flex-col sm:col-span-2 lg:col-span-1"
            label="textarea"
          >
            <Label htmlFor="story-bio">Bio</Label>
            <Textarea
              id="story-bio"
              placeholder="A few words about you…"
              rows={3}
            />
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Inline messaging with optional action slot."
        id="alerts"
        name="Alert"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert>
            <Info />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Deploys queue behind the current build until it finishes.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Build failed</AlertTitle>
            <AlertDescription>
              Type errors found in 2 files. Check the logs for details.
            </AlertDescription>
            <AlertAction>
              <Button size="xs" variant="outline">
                View logs
              </Button>
            </AlertAction>
          </Alert>
        </div>
      </StorySection>

      <StorySection
        description="Numeric callouts in three containers."
        id="stats"
        name="Stat"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat detail="+12% vs last week" label="Visitors" value="18,204" />
          <Stat
            detail="Median across sessions"
            label="Read time"
            value="4m 32s"
            variant="panel"
          />
          <Stat
            detail="Across 42 published notes"
            label="Posts"
            value="42"
            variant="surface"
          />
        </div>
      </StorySection>

      <StorySection
        description="Page and section headers at every scale, plus the eyebrow."
        id="headers"
        name="Headers"
      >
        <div className="space-y-10">
          <EyebrowShowcase />
          <SectionHeader
            description="Compact scales down for dense layouts."
            eyebrow="Section"
            size="compact"
            title="Compact section header"
          />
          <SectionHeader
            description="The default workhorse for most pages."
            eyebrow="Section"
            title="Default section header"
          />
          <SectionHeader
            action={
              <Button size="sm" variant="outline">
                Large action
              </Button>
            }
            description="Large headers open major page divisions."
            eyebrow="Section"
            size="lg"
            title="Large section header"
          />
          <PageHeader
            description="Full page headers include their own separator."
            eyebrow="Page"
            title="Embedded page header"
          />
        </div>
      </StorySection>

      <StorySection
        description="Pill and underline treatments."
        id="tabs"
        name="Tabs"
      >
        <div className="space-y-8">
          <Tabs defaultValue="pill-one">
            <TabsList>
              <TabsTrigger value="pill-one">Overview</TabsTrigger>
              <TabsTrigger value="pill-two">Analytics</TabsTrigger>
              <TabsTrigger value="pill-three">Settings</TabsTrigger>
            </TabsList>
            <TabsContent
              value="pill-one"
              className="pt-3 text-muted-foreground"
            >
              Pill tabs use the muted track with an elevated active state.
            </TabsContent>
            <TabsContent
              value="pill-two"
              className="pt-3 text-muted-foreground"
            >
              Second panel.
            </TabsContent>
            <TabsContent
              value="pill-three"
              className="pt-3 text-muted-foreground"
            >
              Third panel.
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="line-one">
            <TabsList variant="line">
              <TabsTrigger value="line-one">Written</TabsTrigger>
              <TabsTrigger value="line-two">Shipped</TabsTrigger>
              <TabsTrigger value="line-three">Speaking</TabsTrigger>
            </TabsList>
            <TabsContent
              value="line-one"
              className="pt-3 text-muted-foreground"
            >
              Line tabs trade the track for an underline indicator.
            </TabsContent>
            <TabsContent
              value="line-two"
              className="pt-3 text-muted-foreground"
            >
              Second panel.
            </TabsContent>
            <TabsContent
              value="line-three"
              className="pt-3 text-muted-foreground"
            >
              Third panel.
            </TabsContent>
          </Tabs>
        </div>
      </StorySection>

      <StorySection
        description="Loading surfaces, spinners, and progress bars."
        id="feedback"
        name="Feedback"
      >
        <VariantGrid className="lg:grid-cols-2">
          <Variant label="skeleton composition">
            <div className="flex w-full max-w-xs items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </Variant>
          <Variant label="spinner">
            <Spinner className="size-3" />
            <Spinner />
            <Spinner className="size-6" />
            <span className="text-muted-foreground text-sm">
              <Spinner className="inline align-[-0.25em]" /> Loading…
            </span>
          </Variant>
          <Variant className="w-full max-w-sm sm:col-span-2" label="progress">
            <Progress className="w-full" value={68}>
              <ProgressLabel>Storage used</ProgressLabel>
              <ProgressValue>{() => "68%"}</ProgressValue>
            </Progress>
            <Progress className="w-full" value={100} variant="chart">
              <ProgressLabel>Migration complete</ProgressLabel>
              <ProgressValue>{() => "100%"}</ProgressValue>
            </Progress>
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Avatars, keyboard hints, separators, and tooltips."
        id="identity"
        name="Identity"
      >
        <VariantGrid className="lg:grid-cols-2">
          <Variant label="avatar sizes">
            <Avatar size="sm">
              <AvatarFallback>GK</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage alt="" src="/logo.png" />
              <AvatarFallback>GK</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>GK</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          </Variant>
          <Variant label="avatar group">
            <AvatarGroup>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+9</AvatarGroupCount>
            </AvatarGroup>
          </Variant>
          <Variant label="kbd">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <KbdGroup>
              <Kbd>Shift</Kbd>
              <Kbd>?</Kbd>
            </KbdGroup>
            <Kbd>Esc</Kbd>
          </Variant>
          <Variant label="separator">
            <span className="text-muted-foreground text-sm">Left</span>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-muted-foreground text-sm">Right</span>
          </Variant>
          <Variant label="tooltip">
            <Tooltip>
              <TooltipTrigger
                render={<Button size="icon-sm" variant="outline" />}
              >
                <Palette />
                <span className="sr-only">Theme</span>
              </TooltipTrigger>
              <TooltipContent>Change theme</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" />}>
                Hover me
              </TooltipTrigger>
              <TooltipContent>Tooltips float above</TooltipContent>
            </Tooltip>
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Page width and column primitives. Every layout on the site composes from these."
        id="layout"
        name="Layout"
      >
        <div className="space-y-8">
          <VariantGrid>
            <Variant label="Container · shell / narrow">
              <div className="w-full space-y-2">
                <Container
                  className="rounded-lg border bg-surface-sunken/60 p-2"
                  padding="none"
                >
                  <Box>shell (max-w-page)</Box>
                </Container>
                <Container
                  className="rounded-lg border bg-surface-sunken/60 p-2"
                  padding="none"
                  width="narrow"
                >
                  <Box>narrow (max-w-article)</Box>
                </Container>
              </div>
            </Variant>
            <Variant label='Grid · cols={2} / cols={3} from="md"'>
              <Grid className="w-full" cols="2">
                <Box>1</Box>
                <Box>2</Box>
              </Grid>
              <Grid className="w-full" cols="3" from="md">
                <Box>1</Box>
                <Box>2</Box>
                <Box>3</Box>
              </Grid>
            </Variant>
            <Variant label="Grid gap · tight / default / loose / section">
              <Grid className="w-full" cols="3" gap="tight">
                <Box>t</Box>
                <Box>t</Box>
                <Box>t</Box>
              </Grid>
              <Grid className="w-full" cols="3" gap="section">
                <Box>s</Box>
                <Box>s</Box>
                <Box>s</Box>
              </Grid>
            </Variant>
          </VariantGrid>
          <VariantGrid>
            <Variant label='Grid split="sidebar-left"'>
              <Grid className="w-full" split="sidebar-left">
                <Box>0.7fr</Box>
                <Box>1.3fr</Box>
              </Grid>
            </Variant>
            <Variant label='Grid split="hero"'>
              <Grid className="w-full" split="hero">
                <Box>0.9fr</Box>
                <Box>min 22rem · 0.78fr</Box>
              </Grid>
            </Variant>
            <Variant label='Grid split="rail"'>
              <Grid className="w-full" split="rail">
                <Box>0.26fr</Box>
                <Box>1fr</Box>
              </Grid>
            </Variant>
          </VariantGrid>
        </div>
      </StorySection>

      <StorySection
        description="Mono uppercase labels. Sizes and tracking come from theme tokens; Eyebrow is a MonoLabel."
        id="micro-type"
        name="Micro-type"
      >
        <VariantGrid>
          <Variant label="size · default / xs / 2xs">
            <MonoLabel>micro 0.6875rem</MonoLabel>
            <MonoLabel size="xs">nano 0.625rem</MonoLabel>
            <MonoLabel size="2xs">pico 0.5625rem</MonoLabel>
          </Variant>
          <Variant label="tracking · tag / label / eyebrow">
            <MonoLabel tracking="tag">tag 0.12em</MonoLabel>
            <MonoLabel tracking="label">label 0.08em</MonoLabel>
            <MonoLabel tracking="eyebrow">eyebrow 0.16em</MonoLabel>
          </Variant>
          <Variant label="tone · muted / primary / inherit">
            <MonoLabel>muted label</MonoLabel>
            <MonoLabel tone="primary">primary label</MonoLabel>
            <MonoLabel tone="inherit">inherit label</MonoLabel>
          </Variant>
        </VariantGrid>
      </StorySection>

      <StorySection
        description="Theme primitives every component reads from. Dial these before touching component classes."
        id="tokens"
        name="Tokens"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {colorTokens.map((token) => (
            <div className="space-y-1.5" key={token}>
              <div
                className="h-12 rounded-md border shadow-inner"
                style={{ backgroundColor: `var(${token})` }}
              />
              <p className="truncate font-mono text-nano text-muted-foreground">
                {token.replace("--", "")}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <MonoLabel>Brand palettes</MonoLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {brandTokens.map((token) => (
              <div className="space-y-1.5" key={token.name}>
                <div
                  className="h-12 rounded-md border shadow-inner"
                  style={{ backgroundColor: `var(--color-${token.name})` }}
                />
                <p className="truncate font-mono text-nano text-muted-foreground">
                  {token.note || token.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </StorySection>

      <p className="text-muted-foreground text-sm">
        Missing something? Add a section in{" "}
        <Link
          className="text-primary underline-offset-4 hover:underline"
          to="/storybook"
        >
          src/routes/storybook.tsx
        </Link>
        .
      </p>
    </div>
  );
};

export const Route = createFileRoute("/storybook")({
  component: StorybookPage,
  head: () => ({
    meta: [
      { title: "Storybook — Gavin Kline" },
      {
        content: "Component gallery for dialing in the design system.",
        name: "description",
      },
    ],
  }),
});
