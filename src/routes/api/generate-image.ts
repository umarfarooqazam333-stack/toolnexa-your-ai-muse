import { createFileRoute } from "@tanstack/react-router";

import {
  ACCEPTED_REFERENCE_TYPES,
  ASPECT_RATIO_MAP,
  CREDIT_COST_PER_IMAGE,
  MAX_REFERENCE_BYTES,
  buildFinalPrompt,
  type AspectRatioId,
} from "@/lib/image-config";

const MODEL = "@cf/black-forest-labs/flux-2-klein-9b";

type ParsedRequest = {
  prompt: string;
  style: string;
  aspectRatio: AspectRatioId;
  batchId: string | null;
  batchSize: number;
  reference: File | null;
};

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function parseBody(request: Request): Promise<ParsedRequest | { error: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  let raw: Record<string, unknown> = {};
  let reference: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { error: "We could not read your upload. Please try again." };
    }
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") raw[key] = value;
    }
    const file = form.get("reference");
    if (file && typeof file !== "string") reference = file;
  } else {
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return { error: "Invalid request body." };
    }
  }

  const prompt = String(raw["prompt"] ?? "").trim().slice(0, 2000);
  if (prompt.length < 3) {
    return { error: "Please describe the image you want in a few more words." };
  }

  if (reference) {
    if (!ACCEPTED_REFERENCE_TYPES.includes(reference.type)) {
      return { error: "Reference images must be PNG, JPEG or WebP." };
    }
    if (reference.size > MAX_REFERENCE_BYTES) {
      return { error: "Reference image is too large (max 6 MB)." };
    }
    if (reference.size === 0) {
      return { error: "The reference image appears to be empty." };
    }
  }

  const aspectRatio = (
    ASPECT_RATIO_MAP[String(raw["aspectRatio"] ?? "") as AspectRatioId] ? raw["aspectRatio"] : "1:1"
  ) as AspectRatioId;

  return {
    prompt,
    style: String(raw["style"] ?? "none").slice(0, 40),
    aspectRatio,
    batchId: raw["batchId"] ? String(raw["batchId"]).slice(0, 64) : null,
    batchSize: Math.min(5, Math.max(1, Number(raw["batchSize"]) || 1)),
    reference,
  };
}

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"];
        const token = process.env["CLOUDFLARE_API_TOKEN"];
        if (!accountId || !token) {
          return Response.json(
            { error: "Image generation is not configured yet." },
            { status: 503 },
          );
        }

        const parsed = await parseBody(request);
        if ("error" in parsed) {
          return Response.json({ error: parsed.error }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // ---- authenticate (credits are per user) ----
        const authHeader = request.headers.get("authorization") ?? "";
        const accessToken = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7)
          : "";
        if (!accessToken) {
          return Response.json(
            { error: "Please sign in to generate images." },
            { status: 401 },
          );
        }
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.getUser(accessToken);
        const userId = userData?.user?.id;
        if (userError || !userId) {
          return Response.json(
            { error: "Your session expired. Please sign in again." },
            { status: 401 },
          );
        }

        // ---- credit pre-check ----
        const { data: creditRow } = await supabaseAdmin
          .from("user_credits")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle();
        const balance = creditRow?.balance ?? 0;
        if (balance < CREDIT_COST_PER_IMAGE) {
          return Response.json(
            {
              error: `Not enough credits. This image needs ${CREDIT_COST_PER_IMAGE} credit and you have ${balance}.`,
              credits: balance,
            },
            { status: 402 },
          );
        }

        const size = ASPECT_RATIO_MAP[parsed.aspectRatio];
        const finalPrompt = buildFinalPrompt(parsed.prompt, parsed.style);

        const referenceBytes = parsed.reference
          ? await parsed.reference.arrayBuffer()
          : null;

        const buildForm = (opts: { withReference: boolean; withSize: boolean }) => {
          const form = new FormData();
          form.append("prompt", finalPrompt);
          form.append("steps", "4");
          if (opts.withSize) {
            form.append("width", String(size.width));
            form.append("height", String(size.height));
          }
          if (opts.withReference && referenceBytes && parsed.reference) {
            form.append(
              "image",
              new Blob([referenceBytes], { type: parsed.reference.type }),
              parsed.reference.name || "reference.png",
            );
          }
          return form;
        };

        const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;
        const notices: string[] = [];

        async function callProvider(opts: { withReference: boolean; withSize: boolean }) {
          return fetch(endpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: buildForm(opts),
          });
        }

        let upstream: Response;
        let usedReference = Boolean(referenceBytes);
        let usedSize = true;
        try {
          upstream = await callProvider({ withReference: usedReference, withSize: true });

          // The model may not accept a reference image — detect instead of faking it.
          if (upstream.status === 400 && usedReference) {
            usedReference = false;
            notices.push(
              "This model could not use your reference image, so it was generated from your text prompt only.",
            );
            upstream = await callProvider({ withReference: false, withSize: true });
          }
          // Or it may not accept custom dimensions — fall back to its default size.
          if (upstream.status === 400 && usedSize) {
            usedSize = false;
            notices.push(
              `The ${parsed.aspectRatio} aspect ratio is not supported by this model, so the default size was used.`,
            );
            upstream = await callProvider({ withReference: usedReference, withSize: false });
          }
        } catch (error) {
          console.error(
            "[generate-image] provider request failed",
            error instanceof Error ? error.name : "UnknownError",
          );
          return Response.json(
            { error: "The image service is temporarily unavailable. Please try again." },
            { status: 503 },
          );
        }

        if (!upstream.ok) {
          // Never forward provider payloads that could echo credentials.
          console.error("[generate-image] upstream failed", upstream.status);
          if (upstream.status === 429) {
            return Response.json(
              {
                error:
                  "The image service has hit its usage limit for now. Please try again later.",
              },
              { status: 429 },
            );
          }
          if (upstream.status === 400) {
            return Response.json(
              {
                error:
                  "The image service rejected this request. Try rephrasing your prompt or changing the settings.",
              },
              { status: 400 },
            );
          }
          return Response.json(
            { error: "Image generation failed. Please try again." },
            { status: 502 },
          );
        }

        const contentType = upstream.headers.get("content-type") ?? "";
        let base64: string;
        let mime = "image/jpeg";

        if (contentType.startsWith("image/")) {
          mime = contentType;
          base64 = toBase64(await upstream.arrayBuffer());
        } else {
          let json: { result?: { image?: string; images?: string[] } };
          try {
            json = (await upstream.json()) as typeof json;
          } catch {
            console.error("[generate-image] invalid provider response", contentType);
            return Response.json(
              { error: "The image service returned an invalid response. Please try again." },
              { status: 502 },
            );
          }
          const image = json.result?.image ?? json.result?.images?.[0];
          if (!image) {
            console.error("[generate-image] no image in response");
            return Response.json({ error: "No image was returned." }, { status: 502 });
          }
          base64 = image.startsWith("data:") ? image.split(",")[1] ?? "" : image;
          if (!base64) {
            return Response.json({ error: "No image was returned." }, { status: 502 });
          }
        }

        // ---- charge only after a successful generation ----
        const { data: remaining, error: spendError } = await supabaseAdmin.rpc(
          "spend_image_credits",
          { _user_id: userId, _amount: CREDIT_COST_PER_IMAGE },
        );
        if (spendError || remaining === null) {
          return Response.json(
            { error: "Not enough credits to complete this generation.", credits: balance },
            { status: 402 },
          );
        }

        // ---- persist to storage + history (best effort) ----
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const extension = mime.includes("png") ? "png" : "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${extension}`;
        let generationId: string | null = null;

        const upload = await supabaseAdmin.storage
          .from("generated-images")
          .upload(path, bytes, { contentType: mime, upsert: false });

        if (upload.error) {
          console.error("[generate-image] storage upload failed");
        } else {
          const insert = await supabaseAdmin
            .from("image_generations")
            .insert({
              user_id: userId,
              prompt: parsed.prompt,
              final_prompt: finalPrompt,
              style: parsed.style,
              aspect_ratio: parsed.aspectRatio,
              batch_id: parsed.batchId,
              batch_size: parsed.batchSize,
              used_reference: usedReference,
              image_path: path,
              credits_used: CREDIT_COST_PER_IMAGE,
            })
            .select("id")
            .maybeSingle();
          if (insert.error) console.error("[generate-image] history insert failed");
          generationId = insert.data?.id ?? null;
        }

        return Response.json({
          id: generationId,
          image: `data:${mime};base64,${base64}`,
          credits: remaining,
          usedReference,
          notices,
        });
      },
    },
  },
});
