import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  History,
  ImageIcon,
  Maximize2,
  RefreshCw,
  Trash2,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  ASPECT_RATIOS,
  CREDIT_COST_PER_IMAGE,
  IMAGE_COUNT_OPTIONS,
  STYLE_PRESETS,
  creditCostFor,
  type AspectRatioId,
  type StylePresetId,
} from "@/lib/image-config";
import {
  deleteGeneration,
  getImageCredits,
  getImageHistory,
} from "@/lib/image.functions";

const EXAMPLES = [
  "a lone astronaut discovering a glowing forest on an alien moon at dusk",
  "anime girl with silver hair standing in neon Tokyo rain",
  "matte black sports car drifting on a wet mountain road at sunset",
  "YouTube thumbnail: shocked gamer face, bold arrows, glowing background",
];

type ResultCard = { key: string; image: string; prompt: string };

export const Route = createFileRoute("/image-studio")({
  head: () => ({
    meta: [
      { title: "AI Image Studio — Generate Any Image From Text | ToolNexa" },
      {
        name: "description",
        content:
          "Generate anime, realistic, cinematic, product and thumbnail images from any text prompt with ToolNexa's Image Studio — styles, aspect ratios, batches and history included.",
      },
      { property: "og:title", content: "AI Image Studio | ToolNexa" },
      {
        property: "og:description",
        content:
          "Describe any image, pick a style and aspect ratio, and generate up to 5 images at once — securely server-side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImageStudio,
});

function ImageStudio() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<StylePresetId>("none");
  const [ratio, setRatio] = useState<AspectRatioId>("1:1");
  const [count, setCount] = useState(1);
  const [reference, setReference] = useState<{ file: File; url: string } | null>(null);
  const [results, setResults] = useState<ResultCard[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const credits = useQuery({
    queryKey: ["image-credits"],
    queryFn: () => getImageCredits(),
    enabled: signedIn === true,
  });
  const history = useQuery({
    queryKey: ["image-history"],
    queryFn: () => getImageHistory(),
    enabled: signedIn === true,
  });

  const balance = credits.data?.balance ?? 0;
  const cost = creditCostFor(count);
  const loading = progress !== null;

  function pickReference(file: File | undefined) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Reference images must be PNG, JPEG or WebP");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Reference image is too large (max 6 MB)");
      return;
    }
    setReference({ file, url: URL.createObjectURL(file) });
  }

  function clearReference() {
    if (reference) URL.revokeObjectURL(reference.url);
    setReference(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function generateOne(text: string, batchId: string, batchSize: number) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("Please sign in to generate images.");

    const form = new FormData();
    form.append("prompt", text);
    form.append("style", style);
    form.append("aspectRatio", ratio);
    form.append("batchId", batchId);
    form.append("batchSize", String(batchSize));
    if (reference) form.append("reference", reference.file);

    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    // A proxy hiccup can return an HTML error page instead of JSON.
    const data = (await res.json().catch(() => ({}))) as {
      image?: string;
      error?: string;
      credits?: number;
      notices?: string[];
    };
    if (!res.ok || !data.image) {
      throw new Error(data.error ?? "Image generation failed. Please try again.");
    }
    return data;
  }

  async function generate(overridePrompt?: string, overrideCount?: number) {
    const text = (overridePrompt ?? prompt).trim();
    if (text.length < 4) {
      toast.error("Describe your image in a few more words");
      return;
    }
    if (signedIn !== true) {
      toast.error("Please sign in to generate images");
      return;
    }
    const total = overrideCount ?? count;
    if (balance < creditCostFor(total)) {
      toast.error(
        `Not enough credits — ${creditCostFor(total)} needed, ${balance} remaining.`,
      );
      return;
    }

    const batchId = crypto.randomUUID();
    const shownNotices = new Set<string>();
    setResults([]);
    setProgress({ current: 1, total });

    let produced = 0;
    for (let i = 0; i < total; i += 1) {
      setProgress({ current: i + 1, total });
      try {
        const data = await generateOne(text, batchId, total);
        produced += 1;
        setResults((prev) => [
          ...prev,
          { key: `${batchId}-${i}`, image: data.image!, prompt: text },
        ]);
        if (typeof data.credits === "number") {
          queryClient.setQueryData(["image-credits"], { balance: data.credits });
        }
        for (const notice of data.notices ?? []) {
          if (!shownNotices.has(notice)) {
            shownNotices.add(notice);
            toast.info(notice);
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Network error while generating",
        );
        break;
      }
    }

    setProgress(null);
    void credits.refetch();
    void history.refetch();
    if (produced > 0) toast.success(`Generated ${produced} image${produced > 1 ? "s" : ""}`);
  }

  async function removeHistoryItem(id: string) {
    try {
      await deleteGeneration({ data: { id } });
      void history.refetch();
    } catch {
      toast.error("Could not remove that item");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Image Studio
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Prompt in. <span className="text-gradient-brand">Any image out.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Anime, realistic photography, cinematic scenes, cars, characters, product shots,
          thumbnails, concept art — describe anything and ToolNexa renders it with FLUX.2
          Klein 9B. Generation runs entirely server-side; no keys in your browser.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------------- controls ---------------- */}
        <section className="panel space-y-5 p-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-medium">
              Your prompt
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Describe the image you want to create..."
              className="resize-none bg-surface text-base"
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Try:</span>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {example.slice(0, 34)}…
                </button>
              ))}
            </div>
          </div>

          {/* reference image */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">Media / reference image</span>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => pickReference(e.target.files?.[0])}
            />
            {reference ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <img
                  src={reference.url}
                  alt="Reference"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{reference.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Used as a visual reference when the model supports it.
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInput.current?.click()}
                  >
                    Change
                  </Button>
                  <Button variant="ghost" size="icon" onClick={clearReference}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInput.current?.click()}
                className="w-full justify-center sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" /> + Add reference image
              </Button>
            )}
          </div>

          {/* style presets */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">Style preset (optional)</span>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setStyle(preset.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    style === preset.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Presets only add styling hints — your prompt stays exactly as you wrote it.
            </p>
          </div>

          {/* aspect ratio */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">Aspect ratio</span>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRatio(option.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    ratio === option.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* quantity */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">
              Number of images <span className="text-muted-foreground">(frames)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {IMAGE_COUNT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCount(option)}
                  className={`h-9 w-9 rounded-lg border text-sm transition-colors ${
                    count === option
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Each frame is a separate image result — {count} frame{count > 1 ? "s" : ""} ={" "}
              {count} image{count > 1 ? "s" : ""}. Images and frames are one control so you
              never pay for duplicate generations.
            </p>
          </div>

          {/* cost + generate */}
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Estimated cost:{" "}
              <span className="font-medium text-foreground">
                {cost} credit{cost > 1 ? "s" : ""}
              </span>{" "}
              ({CREDIT_COST_PER_IMAGE} per image) · Balance {balance}
            </p>
            <Button
              onClick={() => generate()}
              disabled={loading || (signedIn === true && balance < cost)}
              className="min-w-44"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {loading
                ? `Generating ${progress?.current} of ${progress?.total}…`
                : `Generate ${count} image${count > 1 ? "s" : ""}`}
            </Button>
          </div>
          {signedIn === true && balance < cost ? (
            <p className="text-sm text-destructive">
              Not enough credits — {cost} required, {balance} remaining. Lower the number of
              images to continue.
            </p>
          ) : null}
          {signedIn === false ? (
            <p className="text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary underline">
                Sign in
              </Link>{" "}
              to generate images and track your credits.
            </p>
          ) : null}
        </section>

        {/* ---------------- credits panel ---------------- */}
        <aside className="panel h-fit space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Credits</span>
          </div>
          <p className="font-display text-4xl font-bold">
            {signedIn === true ? balance : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {CREDIT_COST_PER_IMAGE} credit per generated image. Credits are only deducted
            when an image is generated successfully.
          </p>
          <div className="rounded-lg bg-surface p-3 text-xs text-muted-foreground">
            This generation: <span className="text-foreground">{cost}</span> credit
            {cost > 1 ? "s" : ""} · After: {" "}
            <span className="text-foreground">{Math.max(0, balance - cost)}</span>
          </div>
        </aside>
      </div>

      {/* ---------------- results ---------------- */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Results</h2>
        {progress ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Generating image {progress.current} of {progress.total}…
          </p>
        ) : null}
        {results.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <div key={result.key} className="panel space-y-3 p-3">
                <button
                  type="button"
                  onClick={() => setLightbox(result.image)}
                  className="block w-full"
                >
                  <img
                    src={result.image}
                    alt={result.prompt}
                    className="w-full rounded-lg border border-border"
                  />
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <a href={result.image} download={`toolnexa-${result.key}.png`}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLightbox(result.image)}
                  >
                    <Maximize2 className="mr-1.5 h-3.5 w-3.5" /> Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={() => generate(result.prompt, 1)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResults((prev) => prev.filter((item) => item.key !== result.key))
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel mt-4 flex aspect-video w-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <p className="text-sm">
              {loading
                ? `Rendering image ${progress?.current} of ${progress?.total}…`
                : "Your generated images appear here"}
            </p>
          </div>
        )}
      </section>

      {/* ---------------- history ---------------- */}
      {signedIn === true ? (
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Generation history</h2>
          </div>
          {history.data?.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {history.data.map((item) => (
                <div key={item.id} className="panel space-y-2 p-3">
                  {item.url ? (
                    <button
                      type="button"
                      onClick={() => setLightbox(item.url!)}
                      className="block w-full"
                    >
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="aspect-square w-full rounded-lg border border-border object-cover"
                      />
                    </button>
                  ) : null}
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.prompt}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()} · {item.batchSize} image
                    {item.batchSize > 1 ? "s" : ""}
                    {item.usedReference ? " · reference" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPrompt(item.prompt);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Reopen
                    </Button>
                    {item.url ? (
                      <Button asChild variant="ghost" size="sm">
                        <a href={item.url} download={`toolnexa-${item.id}.png`}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHistoryItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Your past generations will be listed here.
            </p>
          )}
        </section>
      ) : null}

      <Dialog open={Boolean(lightbox)} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-4xl border-border bg-background p-2">
          {lightbox ? (
            <img src={lightbox} alt="Generated image" className="w-full rounded-lg" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
