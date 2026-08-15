import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ExternalLink, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ToolWithCategory } from "@/lib/tools.functions";

export function PricingBadge({ model }: { model: string }) {
  const label = model === "free" ? "Free" : model === "paid" ? "Paid" : "Freemium";
  return (
    <Badge
      variant="outline"
      className={
        model === "free"
          ? "border-success/40 text-success"
          : model === "paid"
            ? "border-warning/40 text-warning"
            : "border-brand-cyan/40 text-brand-cyan"
      }
    >
      {label}
    </Badge>
  );
}

export function RatingLabel({
  rating,
  reviews,
}: {
  rating: number | null;
  reviews: number;
}) {
  if (rating === null) {
    return <span className="text-xs text-muted-foreground">No ratings yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground">
      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
      {rating.toFixed(1)}
      <span className="text-muted-foreground">({reviews})</span>
    </span>
  );
}

interface ToolCardProps {
  tool: Pick<
    ToolWithCategory,
    | "id"
    | "slug"
    | "name"
    | "short_description"
    | "pricing_model"
    | "website_url"
    | "rating"
    | "review_count"
    | "is_featured"
    | "tags"
  > & { category?: { name: string; slug: string } | null };
  saved?: boolean;
  onToggleSave?: (toolId: string) => void;
}

export function ToolCard({ tool, saved, onToggleSave }: ToolCardProps) {
  return (
    <article className="panel group flex h-full flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:glow-ring">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand font-display text-lg font-bold text-primary-foreground">
          {tool.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-foreground">
            {tool.name}
          </h3>
          {tool.category && (
            <p className="truncate text-xs text-muted-foreground">{tool.category.name}</p>
          )}
        </div>
        {tool.is_featured && (
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Featured</Badge>
        )}
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {tool.short_description}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <PricingBadge model={tool.pricing_model} />
        <RatingLabel rating={tool.rating} reviews={tool.review_count} />
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button asChild size="sm" className="flex-1">
          <a href={tool.website_url} target="_blank" rel="noopener noreferrer nofollow">
            Visit Tool <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild size="sm" variant="secondary" className="flex-1">
          <Link to="/tool/$slug" params={{ slug: tool.slug }}>
            View Details
          </Link>
        </Button>
        {onToggleSave ? (
          <Button
            size="sm"
            variant="ghost"
            aria-label={saved ? "Remove from saved" : "Save tool"}
            onClick={() => onToggleSave(tool.id)}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <Button asChild size="sm" variant="ghost" aria-label="Sign in to save tools">
            <Link to="/auth">
              <Bookmark className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
