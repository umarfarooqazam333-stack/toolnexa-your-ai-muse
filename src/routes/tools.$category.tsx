import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ToolsExplorer } from "@/components/ToolsExplorer";
import { Button } from "@/components/ui/button";
import { categoryQuery, toolsQuery } from "@/lib/tool-queries";

export const Route = createFileRoute("/tools/$category")({
  loader: async ({ context, params }) => {
    const category = await context.queryClient.ensureQueryData(
      categoryQuery(params.category),
    );
    if (!category) throw notFound();
    await context.queryClient.ensureQueryData(
      toolsQuery({ category: params.category, sort: "popular", page: 1, pageSize: 12 }),
    );
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Category unavailable | ToolNexa" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { name, description } = loaderData.category;
    const title = `Best ${name} AI Tools — Curated & Compared | ToolNexa`;
    const desc =
      description ?? `Compare the best ${name.toLowerCase()} AI tools by pricing and rating.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
      ],
    };
  },
  notFoundComponent: CategoryNotFound,
  errorComponent: CategoryNotFound,
  component: CategoryPage,
});

function CategoryNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Category not found</h1>
      <p className="mt-2 text-muted-foreground">
        That category doesn't exist or was renamed.
      </p>
      <Button asChild className="mt-6">
        <Link to="/categories">Browse all categories</Link>
      </Button>
    </div>
  );
}

function CategoryPage() {
  const { category } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/categories" className="hover:text-foreground">
          Categories
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name} AI Tools
        </h1>
        {category.description && (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        )}
      </header>
      <ToolsExplorer fixedCategory={category.slug} hideCategoryFilter />
    </div>
  );
}
