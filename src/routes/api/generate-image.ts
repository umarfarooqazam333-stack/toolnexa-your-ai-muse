import { createFileRoute } from "@tanstack/react-router";

const MODEL = "@cf/black-forest-labs/flux-2-klein-9b";

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

        let body: { prompt?: unknown; steps?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const prompt = String(body.prompt ?? "").trim().slice(0, 2000);
        if (prompt.length < 3) {
          return Response.json({ error: "Prompt is too short." }, { status: 400 });
        }
        const steps = Math.min(8, Math.max(1, Number(body.steps) || 4));

        const upstream = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, steps }),
          },
        );

        const contentType = upstream.headers.get("content-type") ?? "";

        if (!upstream.ok) {
          // Never forward provider payloads that could echo credentials.
          console.error("[generate-image] upstream failed", upstream.status, (await upstream.text()).slice(0, 500));
          return Response.json(
            { error: "Image generation failed. Please try again." },
            { status: 502 },
          );
        }

        // Some Workers AI models return raw image bytes, others JSON base64.
        if (contentType.startsWith("image/")) {
          const buffer = await upstream.arrayBuffer();
          const base64 = btoa(
            Array.from(new Uint8Array(buffer))
              .map((b) => String.fromCharCode(b))
              .join(""),
          );
          return Response.json({ image: `data:${contentType};base64,${base64}` });
        }

        const json = (await upstream.json()) as {
          result?: { image?: string; images?: string[] };
        };
        const image = json.result?.image ?? json.result?.images?.[0];
        if (!image) {
          console.error("[generate-image] no image in response");
          return Response.json({ error: "No image was returned." }, { status: 502 });
        }
        const dataUrl = image.startsWith("data:") ? image : `data:image/png;base64,${image}`;
        return Response.json({ image: dataUrl });
      },
    },
  },
});
