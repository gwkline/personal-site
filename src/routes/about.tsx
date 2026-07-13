import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AboutPage = () => (
  <div className="space-y-12">
    <PageHeader
      description="I'm a software engineer who cares deeply about the craft of building products that matter."
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

    <div className="prose max-w-none">
      <h2>Background</h2>
      <p>
        I graduated from Syracuse University with a B.S. in Computer Science in
        three academic years while playing on the Division 1 Men&apos;s Lacrosse
        team - the second winningest program in NCAA history. Since then,
        I&apos;ve spent my career working across the stack, from building
        high-performance backend systems to crafting polished user interfaces.
      </p>
      <p>
        Currently, I&apos;m working at GovDash, where I serve as lead founding
        software engineer and product owner of Capture Cloud - our largest and
        fastest-growing product line. Previously, I built marketplace
        infrastructure at Whop (supporting 1M+ MAU), led engineering at Gorjian
        Acquisitions, and developed mission-critical software at CACI Inc for
        the PM IVAS program.
      </p>

      <h2>What I do</h2>
      <p>
        I specialize in backend development, database design, and application
        performance optimization. I&apos;ve driven millions of dollars in
        revenue through the features I&apos;ve shipped and the optimizations
        I&apos;ve implemented. While I often serve in managerial or leadership
        positions, I still see myself primarily as an individual contributor at
        heart - I thrive on hands-on engineering, and consistently serve as the
        top code contributor and lead reviewer on my teams.
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
  </div>
);
export const Route = createFileRoute("/about")({
  component: AboutPage,
});
