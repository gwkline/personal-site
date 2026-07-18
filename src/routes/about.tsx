import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

const skills = [
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
];

const AboutPage = () => (
  <div className="space-y-20 pb-8 sm:space-y-24">
    <PageHeader
      description="I'm a software engineer and engineering leader who cares deeply about the craft of building products that matter."
      eyebrow="About Gavin"
      title="About"
    >
      <div className="flex flex-wrap gap-3">
        <Button
          nativeButton={false}
          render={
            <a aria-label="Email me" href="mailto:hello@gavinkline.com" />
          }
          variant="outline"
        >
          <Mail className="size-4" />
          Email me
        </Button>
        <Button
          nativeButton={false}
          render={
            <a aria-label="Download resume" download href="/resume.pdf" />
          }
          variant="outline"
        >
          <Download className="size-4" />
          Download resume
        </Button>
      </div>
    </PageHeader>

    <section className="scroll-mt-24 space-y-7" id="background">
      <SectionHeader
        description="A career spent moving between architecture, product, and the teams responsible for shipping both."
        eyebrow="Background"
        title="Across the stack and close to the work"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="muted">
          <CardHeader>
            <CardTitle variant="section">A fast start</CardTitle>
            <CardDescription size="lg">
              Computer science and Division I lacrosse at Syracuse.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            I graduated from Syracuse University with a B.S. in Computer Science
            in three academic years while playing on the Division I Men&apos;s
            Lacrosse team—the second-winningest program in NCAA history. Since
            then, I&apos;ve worked across the stack, from high-performance
            backend systems to polished user interfaces.
          </CardContent>
        </Card>

        <Card variant="feature">
          <CardHeader>
            <CardTitle variant="section">Leading at GovDash</CardTitle>
            <CardDescription size="lg">
              Engineering leadership grounded in product and technical
              execution.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            I&apos;m currently Head of Engineering at GovDash, leading
            engineering for a 20-person organization and defining our
            company-wide AI strategy. I architected our agent execution platform
            and own product and technical strategy across products including
            Capture and Discover.
          </CardContent>
        </Card>
      </div>
      <p className="max-w-3xl text-muted-foreground leading-relaxed">
        Previously, I built marketplace infrastructure at Whop supporting more
        than 1M monthly active users, served as VP of Software Engineering at
        Gorjian Acquisitions, and developed mission-critical software at CACI
        Inc. for the PM IVAS program.
      </p>
    </section>

    <section
      className="scroll-mt-24 grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-start"
      id="working-style"
    >
      <SectionHeader
        description="I lead teams, but I remain an individual contributor at heart."
        eyebrow="How I work"
        title="Hands-on by default"
      />
      <Card variant="glass">
        <CardContent className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          I specialize in backend development, database design, and application
          performance optimization. The features and optimizations I&apos;ve
          shipped have driven millions of dollars in revenue. Even in management
          and leadership roles, I thrive on hands-on engineering and
          consistently serve as the top code contributor and lead reviewer on my
          teams.
        </CardContent>
      </Card>
    </section>

    <section className="scroll-mt-24 space-y-6" id="toolkit">
      <SectionHeader
        description="The tools I reach for most often when turning product ideas into dependable systems."
        eyebrow="Toolkit"
        title="Core technologies"
      />
      <Card variant="sunken">
        <CardContent className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </section>
  </div>
);
export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Gavin Kline" },
      {
        content:
          "Engineering leader and hands-on software engineer building dependable products, platforms, and teams.",
        name: "description",
      },
    ],
  }),
});
