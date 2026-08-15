import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROMPT_TYPE_META } from "@/lib/prompt-engine";
import { categoriesQuery, statsQuery, toolsQuery } from "@/lib/tool-queries";

const featured = toolsQuery({ featured: true, sort: "popular", page: 1, pageSize: 6 });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featured),
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(statsQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "ToolNexa — AI Tools Finder & Prompt Studio" },
      {
        name: "description",
        content:
          "Find the right AI tool from a curated directory, then turn one idea into six expert prompts for image, video, thumbnail, character, anime and realistic models.",
      },
      { property: "og:title", content: "ToolNexa — AI Tools Finder & Prompt Studio" },
      {
        property: "og:description",
        content:
          "A curated AI tools directory plus a prompt studio that expands one idea into six specialised prompts.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const tools = useSuspenseQuery(featured);
  const categories = useSuspenseQuery(categoriesQuery());
  const stats = useSuspenseQuery(statsQuery());

  return (
    <div>
      <section className="border-b border-border bg-surface/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-3xl">
            <Badge variant="outline" className="border-primary/40 text-primary">
              {stats.data.tools} curated tools · {stats.data.categories} categories
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Find the right AI tool.{" "}
              <span className="text-gradient-brand">Then write the perfect prompt.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              ToolNexa pairs a human-curated AI tools directory with a Prompt Studio that
              expands one plain idea into six specialised, production-ready prompts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/tools" search={{ q: "", free: false }}>
                  Explore AI tools <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/prompt-studio">
                  <Sparkles className="mr-1.5 h-4 w-4" /> Open Prompt Studio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Featured tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviewed picks across every discipline.
            </p>
          </div>
          <Link
            to="/tools"
            search={{ q: "", free: false }}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all {stats.data.tools} tools
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.data.tools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold">One idea. Six prompts.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Prompt Studio runs a rule-based engine locally — no API key, no credits, instant
            results.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PROMPT_TYPE_META).map(([type, meta]) => (
              <article key={type} className="panel space-y-2 p-5">
                <h3 className="font-display text-base font-semibold">{meta.label}</h3>
                <p className="text-sm text-muted-foreground">{meta.blurb}</p>
              </article>
            ))}
          </div>
          <Button asChild className="mt-8">
            <Link to="/prompt-studio">Generate my prompt set</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold">Browse by category</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.data.map((category) => (
            <Link
              key={category.slug}
              to="/tools/$category"
              params={{ category: category.slug }}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
