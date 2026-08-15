import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PROMPT_TYPES, type PromptType } from "@/lib/prompt-engine";
import { resolvePromptProvider } from "@/lib/prompt-provider";

const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

/* ---------------------------- saved tools ---------------------------- */

export const getSavedTools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_tools")
      .select("id,created_at,tools(id,slug,name,short_description,pricing_model,website_url,rating,review_count,is_featured,is_popular,tags,categories(name,slug))")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      savedId: row.id,
      savedAt: row.created_at,
      tool: row.tools ? { ...row.tools, category: row.tools.categories ?? null } : null,
    }));
  });

export const getSavedToolIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_tools")
      .select("tool_id")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.tool_id);
  });

export const toggleSavedTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ({ toolId: str((data as any)?.toolId, 40) }))
  .handler(async ({ context, data }) => {
    const existing = await context.supabase
      .from("saved_tools")
      .select("id")
      .eq("user_id", context.userId)
      .eq("tool_id", data.toolId)
      .maybeSingle();

    if (existing.data) {
      const { error } = await context.supabase
        .from("saved_tools")
        .delete()
        .eq("id", existing.data.id);
      if (error) throw new Error(error.message);
      return { saved: false };
    }

    const { error } = await context.supabase
      .from("saved_tools")
      .insert({ user_id: context.userId, tool_id: data.toolId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

/* ------------------------------ prompts ------------------------------ */

export const listPrompts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as Record<string, unknown>;
    const type = str(d["type"], 20);
    return {
      q: str(d["q"], 120),
      type: PROMPT_TYPES.includes(type as PromptType) ? (type as PromptType) : "",
    };
  })
  .handler(async ({ context, data }) => {
    let query = context.supabase
      .from("prompts")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (data.type) query = query.eq("prompt_type", data.type);
    if (data.q) {
      const term = data.q.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`title.ilike.%${term}%,idea.ilike.%${term}%,content.ilike.%${term}%`);
    }

    const { data: rows, error } = await query.limit(200);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const savePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as Record<string, unknown>;
    const type = str(d["promptType"], 20);
    if (!PROMPT_TYPES.includes(type as PromptType)) throw new Error("Unknown prompt type");
    const content = str(d["content"], 8000);
    if (!content.trim()) throw new Error("Prompt content is empty");
    return {
      promptType: type as PromptType,
      content,
      idea: str(d["idea"], 1000),
      title: str(d["title"], 160),
    };
  })
  .handler(async ({ context, data }) => {
    const provider = resolvePromptProvider();
    const { data: row, error } = await context.supabase
      .from("prompts")
      .insert({
        user_id: context.userId,
        prompt_type: data.promptType,
        content: data.content,
        idea: data.idea,
        title: data.title || data.idea.slice(0, 80),
        provider: provider.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ({ id: str((data as any)?.id, 40) }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("prompts")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
