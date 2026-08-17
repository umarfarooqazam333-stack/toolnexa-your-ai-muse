import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type ToolRow = Database["public"]["Tables"]["tools"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export interface ToolWithCategory extends ToolRow {
  category: Pick<CategoryRow, "name" | "slug"> | null;
}

export type ToolSort = "popular" | "rating" | "newest" | "az";

export interface ToolQuery {
  q: string | undefined;
  category: string | undefined;
  pricing: string[] | undefined;
  minRating: number | undefined;
  freeOnly: boolean;
  featured: boolean;
  popular: boolean;
  sort: ToolSort;
  page: number;
  pageSize: number;
}

const TOOL_SELECT =
  "id,slug,name,short_description,description,features,tags,pricing_model,pricing_info,website_url,logo_url,rating,review_count,is_featured,is_popular,status,source,source_url,last_verified,created_at,updated_at,category_id,categories(name,slug)";

// Lightweight projection for list/grid views — skips long text columns so
// directory pages transfer far less data and render faster.
const LIST_SELECT =
  "id,slug,name,short_description,features,tags,pricing_model,website_url,logo_url,rating,review_count,is_featured,is_popular,status,category_id,created_at,categories(name,slug)";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    },
  );
}

function shape(rows: any[]): ToolWithCategory[] {
  return (rows ?? []).map((row) => {
    const { categories, ...rest } = row;
    return { ...rest, category: categories ?? null } as ToolWithCategory;
  });
}

function parseQuery(data: unknown): ToolQuery {
  const d = (data ?? {}) as Record<string, unknown>;
  const sort = String(d["sort"] ?? "popular");
  const q = d["q"];
  const category = d["category"];
  const pricing = d["pricing"];
  const minRating = d["minRating"];
  return {
    q: typeof q === "string" && q.trim() ? q.slice(0, 120) : undefined,
    category: typeof category === "string" && category ? category.slice(0, 60) : undefined,
    pricing: Array.isArray(pricing)
      ? pricing.filter((p): p is string => ["free", "freemium", "paid"].includes(String(p)))
      : undefined,
    minRating: typeof minRating === "number" ? Math.min(5, Math.max(0, minRating)) : undefined,
    freeOnly: d["freeOnly"] === true,
    featured: d["featured"] === true,
    popular: d["popular"] === true,
    sort: (["popular", "rating", "newest", "az"].includes(sort) ? sort : "popular") as ToolSort,
    page: Math.max(1, Number(d["page"] ?? 1) || 1),
    pageSize: Math.min(48, Math.max(6, Number(d["pageSize"] ?? 12) || 12)),
  };
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listTools = createServerFn({ method: "GET" })
  .inputValidator(parseQuery)
  .handler(async ({ data: params }) => {
    const supabase = publicClient();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;

    let query = supabase
      .from("tools")
      .select(LIST_SELECT, { count: "exact" })
      .eq("status", "PUBLISHED");

    if (params.category && params.category !== "free-ai-tools") {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.category)
        .maybeSingle();
      if (!cat) return { tools: [] as ToolWithCategory[], total: 0, page, pageSize };
      query = query.eq("category_id", cat.id);
    }
    if (params.category === "free-ai-tools" || params.freeOnly) {
      query = query.eq("pricing_model", "free");
    }
    if (params.pricing && params.pricing.length > 0) {
      query = query.in("pricing_model", params.pricing);
    }
    if (params.minRating && params.minRating > 0) {
      query = query.gte("rating", params.minRating);
    }
    if (params.featured) query = query.eq("is_featured", true);
    if (params.popular) query = query.eq("is_popular", true);

    if (params.q) {
      const term = params.q.replace(/[%,()]/g, " ").trim();
      if (term) {
        query = query.or(
          [
            `name.ilike.%${term}%`,
            `short_description.ilike.%${term}%`,
            `description.ilike.%${term}%`,
            `pricing_info.ilike.%${term}%`,
          ].join(","),
        );
      }
    }

    switch (params.sort) {
      case "rating":
        query = query.order("rating", { ascending: false, nullsFirst: false }).order("name");
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "az":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query
          .order("is_popular", { ascending: false })
          .order("is_featured", { ascending: false })
          .order("name", { ascending: true });
    }

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);

    let tools = shape(data as any[]);

    // Tag/feature matches are array columns; merge them in for a real search.
    if (params.q && tools.length < pageSize && page === 1) {
      const term = params.q.trim().toLowerCase();
      const { data: extra } = await supabase
        .from("tools")
        .select(LIST_SELECT)
        .eq("status", "PUBLISHED")
        .limit(200);
      const seen = new Set(tools.map((t) => t.id));
      for (const row of shape(extra as any[])) {
        if (seen.has(row.id)) continue;
        const haystack = [...(row.tags ?? []), ...(row.features ?? []), row.category?.name ?? ""]
          .join(" ")
          .toLowerCase();
        if (haystack.includes(term)) tools.push(row);
        if (tools.length >= pageSize) break;
      }
    }

    return { tools, total: count ?? tools.length, page, pageSize };
  });

export const getToolBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ({ slug: String((data as any)?.slug ?? "").slice(0, 80) }))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("tools")
      .select(TOOL_SELECT)
      .eq("slug", data.slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const tool = shape([row])[0]!;
    const { data: similar } = await supabase
      .from("tools")
      .select(LIST_SELECT)
      .eq("status", "PUBLISHED")
      .eq("category_id", tool.category_id)
      .neq("id", tool.id)
      .limit(3);

    return { tool, similar: shape(similar as any[]) };
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ({ slug: String((data as any)?.slug ?? "").slice(0, 60) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("categories")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getDirectoryStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [tools, free, categories] = await Promise.all([
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    supabase
      .from("tools")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED")
      .eq("pricing_model", "free"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);
  return {
    tools: tools.count ?? 0,
    free: free.count ?? 0,
    categories: categories.count ?? 0,
  };
});
