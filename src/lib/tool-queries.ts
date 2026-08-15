import { queryOptions } from "@tanstack/react-query";

import {
  getCategories,
  getCategoryBySlug,
  getDirectoryStats,
  getToolBySlug,
  listTools,
} from "@/lib/tools.functions";

export interface ToolQueryInput {
  q?: string;
  category?: string;
  pricing?: string[];
  minRating?: number;
  freeOnly?: boolean;
  featured?: boolean;
  popular?: boolean;
  sort?: "popular" | "rating" | "newest" | "az";
  page?: number;
  pageSize?: number;
}

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  });

export const toolsQuery = (params: ToolQueryInput) =>
  queryOptions({
    queryKey: ["tools", params],
    queryFn: () => listTools({ data: params }),
    staleTime: 60 * 1000,
  });

export const toolQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tool", slug],
    queryFn: () => getToolBySlug({ data: { slug } }),
    staleTime: 60 * 1000,
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
