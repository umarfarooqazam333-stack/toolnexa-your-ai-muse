import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import {
  getCategories,
  getCategoryBySlug,
  getDirectoryStats,
  getToolBySlug,
  listTools,
} from "@/lib/tools.functions";

export type ToolSort = "popular" | "rating" | "newest" | "az";

export interface ToolQueryInput {
  q?: string | undefined;
  category?: string | undefined;
  pricing?: string[] | undefined;
  minRating?: number | undefined;
  freeOnly?: boolean | undefined;
  featured?: boolean | undefined;
  popular?: boolean | undefined;
  sort?: ToolSort | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 30 * 60 * 1000,
  });

export const toolsQuery = (params: ToolQueryInput) =>
  queryOptions({
    queryKey: ["tools", params],
    queryFn: () => listTools({ data: params }),
    staleTime: 5 * 60 * 1000,
    // Keep the previous results on screen while new filters load — no flicker.
    placeholderData: keepPreviousData,
  });

export const toolQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tool", slug],
    queryFn: () => getToolBySlug({ data: { slug } }),
    staleTime: 10 * 60 * 1000,
  });

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });

export const statsQuery = () =>
  queryOptions({
    queryKey: ["directory-stats"],
    queryFn: () => getDirectoryStats(),
    staleTime: 5 * 60 * 1000,
  });
