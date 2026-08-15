import { createFileRoute } from "@tanstack/react-router";

import { ToolsExplorer } from "@/components/ToolsExplorer";
import { categoriesQuery, toolsQuery } from "@/lib/tool-queries";

export const Route = createFileRoute("/tools/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    free: search["free"] === true || search["free"] === "true",
  }),
  loaderDeps: ({ search }) => ({ q: search.q, free: search.free }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(
        toolsQuery({
          q: deps.q || undefined,
          freeOnly: deps.free,
          sort: "popular",
          page: 1,
          pageSize: 12,
        }),
      ),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Browse AI Tools — Search 45+ Curated Tools | ToolNexa" },
      {
        name: "description",
        content:
          "Search and filter a curated directory of AI tools by category, pricing and rating. Find free, freemium and paid AI tools for image, video, writing and code.",
      },
      { property: "og:title", content: "Browse AI Tools | ToolNexa" },
      {
        property: "og:description",
        content:
          "Filter curated AI tools by category, pricing and rating — image, video, writing, code and more.",
      },
    ],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const { q, free } = Route.useSearch();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {free ? "Free AI Tools" : "AI Tools Directory"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {free
            ? "Every tool below has a genuinely free tier — no trial-only entries."
            : "A curated, human-reviewed directory. Filter by category, pricing model and rating to find exactly what your workflow needs."}
        </p>
      </header>
      <ToolsExplorer initialQ={q} initialFreeOnly={free} />
    </div>
  );
}
