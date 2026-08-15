import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Check, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PricingBadge, RatingLabel, ToolCard } from "@/components/ToolCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toolQuery } from "@/lib/tool-queries";
import { getSavedToolIds, toggleSavedTool } from "@/lib/user.functions";

export const Route = createFileRoute("/tool/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(toolQuery(params.slug));
    if (!result) throw notFound();
    return { tool: result.tool, similar: result.similar };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Tool unavailable | ToolNexa" }, { name: "robots", content: "noindex" }],
      };
    }
    const { name, short_description, pricing_model } = loaderData.tool;
    const title = `${name} Review — Features, Pricing & Alternatives | ToolNexa`;
    const desc = `${short_description} ${pricing_model === "free" ? "Free to use." : pricing_model === "freemium" ? "Free tier available." : "Paid plans."}`;
    return {
      meta: [
        { title: title.slice(0, 68) },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: `${name} — reviewed on ToolNexa` },
        { property: "og:description", content: desc.slice(0, 158) },
      ],
    };
  },
  notFoundComponent: ToolNotFound,
  errorComponent: ToolNotFound,
  component: ToolDetail,
});

function ToolNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Tool not found</h1>
      <p className="mt-2 text-muted-foreground">This tool isn't in the directory yet.</p>
      <Button asChild className="mt-6">
        <Link to="/tools" search={{ q: "", free: false }}>
          Browse all tools
        </Link>
      </Button>
    </div>
  );
}

function ToolDetail() {
  const { tool, similar } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const saved = useQuery({
    queryKey: ["saved-tool-ids"],
    queryFn: () => getSavedToolIds(),
    enabled: signedIn,
  });

  const toggle = useMutation({
    mutationFn: () => toggleSavedTool({ data: { toolId: tool.id } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["saved-tool-ids"] });
      queryClient.invalidateQueries({ queryKey: ["saved-tools"] });
      toast.success(res.saved ? "Saved to your library" : "Removed from saved");
    },
    onError: () => toast.error("Could not update your saved tools"),
  });

  const isSaved = (saved.data ?? []).includes(tool.id);
  const features = (tool.features ?? []) as string[];
  const useCases: string[] = [];
  const tags = (tool.tags ?? []) as string[];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/tools" search={{ q: "", free: false }} className="hover:text-foreground">
          Tools
        </Link>
        {tool.category && (
          <>
            <span className="px-2">/</span>
            <Link
              to="/tools/$category"
              params={{ category: tool.category.slug }}
              className="hover:text-foreground"
            >
              {tool.category.name}
            </Link>
          </>
        )}
        <span className="px-2">/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <header className="panel flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-brand font-display text-2xl font-bold text-primary-foreground">
              {tool.name.charAt(0)}
            </span>
            <div className="min-w-0 space-y-3">
              <h1 className="font-display text-3xl font-bold tracking-tight">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.short_description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <PricingBadge model={tool.pricing_model} />
                <RatingLabel rating={tool.rating} reviews={tool.review_count} />
                {tool.is_featured && (
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {tool.description && (
            <section className="panel space-y-3 p-6">
              <h2 className="font-display text-xl font-semibold">Overview</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </section>
          )}

          {features.length > 0 && (
            <section className="panel space-y-4 p-6">
              <h2 className="font-display text-xl font-semibold">Key features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {useCases.length > 0 && (
            <section className="panel space-y-4 p-6">
              <h2 className="font-display text-xl font-semibold">Best used for</h2>
              <div className="flex flex-wrap gap-2">
                {useCases.map((useCase) => (
                  <Badge key={useCase} variant="outline" className="border-border">
                    {useCase}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="panel space-y-3 p-6">
            <Button asChild className="w-full">
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer nofollow">
                Visit {tool.name} <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            {signedIn ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => toggle.mutate()}
                disabled={toggle.isPending}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1.5 h-4 w-4" /> Save tool
                  </>
                )}
              </Button>
            ) : (
              <Button asChild variant="secondary" className="w-full">
                <Link to="/auth">Sign in to save</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link to="/prompt-studio">Generate prompts for this tool</Link>
            </Button>
          </div>

          <dl className="panel space-y-3 p-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pricing</dt>
              <dd className="capitalize text-foreground">{tool.pricing_model}</dd>
            </div>
            {tool.category && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="text-foreground">{tool.category.name}</dd>
              </div>
            )}
            {tags.length > 0 && (
              <div className="space-y-2 pt-1">
                <dt className="text-muted-foreground">Tags</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {similar.filter((t) => t.id !== tool.id).length > 0 && (
        <section className="mt-16 space-y-6">
          <h2 className="font-display text-2xl font-semibold">
            Alternatives to {tool.name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar
              .filter((t) => t.id !== tool.id)
              .slice(0, 3)
              .map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
