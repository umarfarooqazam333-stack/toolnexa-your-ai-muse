import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriesQuery,
  toolsQuery,
  type ToolQueryInput,
  type ToolSort,
} from "@/lib/tool-queries";
import { getSavedToolIds, toggleSavedTool } from "@/lib/user.functions";
import { cn } from "@/lib/utils";

const PRICING = ["free", "freemium", "paid"] as const;
const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A-Z" },
] as const;

interface Props {
  initialQ?: string;
  fixedCategory?: string;
  hideCategoryFilter?: boolean;
}

export function ToolsExplorer({ initialQ = "", fixedCategory, hideCategoryFilter }: Props) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState(initialQ);
  const [term, setTerm] = useState(initialQ);
  const [category, setCategory] = useState(fixedCategory ?? "all");
  const [pricing, setPricing] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("0");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<ToolSort>("popular");
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [pageSize, setPageSize] = useState(12);
  const [signedIn, setSignedIn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => setQ(initialQ), [initialQ]);
  useEffect(() => setTerm(initialQ), [initialQ]);
  useEffect(() => {
    const t = setTimeout(() => setQ(term), 300);
    return () => clearTimeout(t);
  }, [term]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const params: ToolQueryInput = {
    q: q || undefined,
    category: fixedCategory ?? (category === "all" ? undefined : category),
    pricing: pricing.length ? pricing : undefined,
    minRating: Number(minRating) || undefined,
    freeOnly,
    featured,
    popular,
    sort,
    page: 1,
    pageSize,
  };

  const categories = useQuery(categoriesQuery());
  const tools = useQuery(toolsQuery(params));
  const saved = useQuery({
    queryKey: ["saved-tool-ids"],
    queryFn: () => getSavedToolIds(),
    enabled: signedIn,
  });

  const toggle = useMutation({
    mutationFn: (toolId: string) => toggleSavedTool({ data: { toolId } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["saved-tool-ids"] });
      queryClient.invalidateQueries({ queryKey: ["saved-tools"] });
      toast.success(res.saved ? "Tool saved" : "Removed from saved");
    },
    onError: () => toast.error("Could not update your saved tools"),
  });

  const total = tools.data?.total ?? 0;
  const list = tools.data?.tools ?? [];

  return (
    <div className="space-y-6">
      <div className="panel flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search AI tools, e.g. free AI video generator"
              aria-label="Search AI tools"
              className="h-11 bg-surface pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as ToolSort)}>
            <SelectTrigger className="h-11 w-full sm:w-48" aria-label="Sort tools">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="secondary"
            className="h-11 lg:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        <div
          className={cn(
            "grid gap-5 border-t border-border pt-4 lg:grid-cols-4",
            showFilters ? "grid" : "hidden lg:grid",
          )}
        >
          {!hideCategoryFilter && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(categories.data ?? []).map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Pricing
            </Label>
            <div className="flex flex-wrap gap-3">
              {PRICING.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox
                    checked={pricing.includes(p)}
                    onCheckedChange={(checked) =>
                      setPricing((prev) =>
                        checked ? [...prev, p] : prev.filter((x) => x !== p),
                      )
                    }
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Minimum rating
            </Label>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger aria-label="Filter by rating">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any rating</SelectItem>
                <SelectItem value="3">3.0+</SelectItem>
                <SelectItem value="4">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Quick filters
            </Label>
            <div className="space-y-2">
              <label className="flex items-center justify-between gap-3 text-sm">
                Free only
                <Switch checked={freeOnly} onCheckedChange={setFreeOnly} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                Featured
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                Popular
                <Switch checked={popular} onCheckedChange={setPopular} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {tools.isPending ? "Searching..." : `${total} tool${total === 1 ? "" : "s"} found`}
      </p>

      {tools.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="panel p-10 text-center">
          <h3 className="font-display text-lg font-semibold">No tools matched that search</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a broader term, or clear the filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                saved={(saved.data ?? []).includes(tool.id)}
                {...(signedIn ? { onToggleSave: (id: string) => toggle.mutate(id) } : {})}
              />
            ))}
          </div>
          {list.length < total && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setPageSize((s) => s + 12)}>
                Load more tools
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
