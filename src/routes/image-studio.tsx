import { createFileRoute } from "@tanstack/react-router";
import { Download, ImageIcon, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLES = [
  "a lone astronaut discovering a glowing forest on an alien moon at dusk",
  "cyberpunk street food vendor in neon rain, steam rising from the grill",
  "minimal product shot of a matte black coffee grinder on concrete",
];

export const Route = createFileRoute("/image-studio")({
  head: () => ({
    meta: [
      { title: "AI Image Studio — Generate Images From Prompts | ToolNexa" },
      {
        name: "description",
        content:
          "Generate high-quality AI images from any text prompt with ToolNexa's Image Studio, powered by the FLUX.2 Klein 9B model on Cloudflare Workers AI.",
      },
      { property: "og:title", content: "AI Image Studio | ToolNexa" },
      {
        property: "og:description",
        content:
          "Type a prompt and get a generated image in seconds — FLUX.2 Klein 9B running securely server-side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImageStudio,
});

function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    const trimmed = prompt.trim();
    if (trimmed.length < 4) {
      toast.error("Describe your image in a few more words");
      return;
    }
    setLoading(true);
    setImage(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = (await res.json()) as { image?: string; error?: string };
      if (!res.ok || !data.image) {
        toast.error(data.error ?? "Image generation failed");
        return;
      }
      setImage(data.image);
    } catch {
      toast.error("Network error while generating the image");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Image Studio
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Prompt in. <span className="text-gradient-brand">Image out.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Describe what you want to see and ToolNexa renders it with the FLUX.2 Klein 9B
          model. Generation runs entirely server-side — no keys in your browser.
        </p>
      </header>

      <section className="panel mt-8 space-y-4 p-6">
        <label htmlFor="prompt" className="block text-sm font-medium">
          Your prompt
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. a lone astronaut discovering a glowing forest on an alien moon at dusk"
          className="resize-none bg-surface text-base"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={generate} disabled={loading} className="min-w-40">
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Generating…" : "Generate image"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {example.slice(0, 38)}…
            </button>
          ))}
        </div>
      </section>

      <section className="panel mt-8 p-6">
        {image ? (
          <div className="space-y-4">
            <img
              src={image}
              alt={prompt}
              className="w-full rounded-xl border border-border"
            />
            <Button asChild variant="secondary" size="sm">
              <a href={image} download="toolnexa-image.png">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </a>
            </Button>
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-surface text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="text-sm">
              {loading ? "Rendering your image…" : "Your generated image appears here"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
