import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HistoryItem = {
  id: string;
  prompt: string;
  style: string | null;
  aspectRatio: string | null;
  batchId: string | null;
  batchSize: number;
  usedReference: boolean;
  createdAt: string;
  url: string | null;
};

export const getImageCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { balance: data?.balance ?? 0 };
  });

export const getImageHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HistoryItem[]> => {
    const { data, error } = await context.supabase
      .from("image_generations")
      .select(
        "id,prompt,style,aspect_ratio,batch_id,batch_size,used_reference,image_path,created_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const signed = rows.length
      ? await context.supabase.storage
          .from("generated-images")
          .createSignedUrls(
            rows.map((row) => row.image_path),
            60 * 60 * 6,
          )
      : { data: [] as { signedUrl: string | null }[] };

    return rows.map((row, index) => ({
      id: row.id,
      prompt: row.prompt,
      style: row.style,
      aspectRatio: row.aspect_ratio,
      batchId: row.batch_id,
      batchSize: row.batch_size,
      usedReference: row.used_reference,
      createdAt: row.created_at,
      url: signed.data?.[index]?.signedUrl ?? null,
    }));
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ({
    id: String((data as { id?: unknown })?.id ?? "").slice(0, 64),
  }))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("image_generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
