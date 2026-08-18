import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { categoriesQuery } from "@/lib/tool-queries";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery()),
  head: () => ({
    meta: [
      { title: "AI Tool Categories — Image, Video, Writing, Code | ToolNexa" },
      {
        name: "description",
        content:
          "Explore AI tools by category: image generation, video, writing, code, audio, productivity, design, research and marketing.",
      },
      { property: "og:title", content: "AI Tool Categories | ToolNexa" },
      {
        property: "og:description",
        content: "Nine curated categories covering the full AI tool landscape.",
      },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/categories" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Browse by category
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every category is human-curated. Pick a discipline and compare the tools that
          actually ship results.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            to="/tools/$category"
            params={{ category: category.slug }}
            className="panel group flex flex-col gap-3 p-6 transition-transform hover:-translate-y-0.5 hover:glow-ring"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">
              {category.name}
            </h2>
            {category.description && (
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
              Explore tools
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
