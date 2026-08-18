import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  PROMPT_TYPE_META,
  generateAllPrompts,
  type GeneratedPrompt,
} from "@/lib/prompt-engine";
import { savePrompt } from "@/lib/user.functions";

const EXAMPLES = [
  "a lone astronaut discovering a glowing forest on an alien moon at dusk",
  "cyberpunk street food vendor in neon rain, steam rising from the grill",
  "minimal product shot of a matte black coffee grinder on concrete",
];

export const Route = createFileRoute("/prompt-studio")({
  head: () => ({
    meta: [
      { title: "AI Prompt Studio — One Idea, Six Expert Prompts | ToolNexa" },
      {
        name: "description",
        content:
          "Turn a single idea into six specialised AI prompts for image, video, thumbnail, character, anime and photorealistic generation. Free, instant, no API key.",
      },
      { property: "og:title", content: "AI Prompt Studio | ToolNexa" },
      {
        property: "og:description",
        content:
          "One idea becomes six production-ready prompts for image, video, thumbnail, character, anime and realistic models.",
      },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/prompt-studio" }],
  }),
  component: PromptStudio,
});

function PromptStudio() {
  const [idea, setIdea] = useState("");
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  const save = useMutation({
    mutationFn: (prompt: GeneratedPrompt) =>
      savePrompt({
        data: {
          promptType: prompt.type,
          content: prompt.content,
          idea,
          title: `${prompt.label}: ${idea.slice(0, 60)}`,
        },
      }),
    onSuccess: () => toast.success("Prompt saved to your library"),
    onError: () => toast.error("Could not save that prompt"),
  });

  function generate(nextSeed = seed) {
    const trimmed = idea.trim();
    if (trimmed.length < 4) {
      toast.error("Describe your idea in a few more words");
      return;
    }
    setPrompts(generateAllPrompts(trimmed, nextSeed));
  }

  async function copy(prompt: GeneratedPrompt) {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(prompt.type);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Clipboard is blocked in this browser");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Prompt Studio
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          One idea. <span className="text-gradient-brand">Six expert prompts.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Type a plain-language idea. ToolNexa expands it into six specialised prompts —
          tuned for image, video, thumbnail, character, anime and photorealistic models.
          Runs instantly, no API key needed.
        </p>
      </header>

      <section className="panel mt-8 space-y-4 p-6">
        <label htmlFor="idea" className="block text-sm font-medium">
          Your idea
        </label>
        <Textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="e.g. a lone astronaut discovering a glowing forest on an alien moon at dusk"
          className="resize-none bg-surface text-base"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => generate()} className="min-w-40">
            <Wand2 className="mr-2 h-4 w-4" /> Generate 6 prompts
          </Button>
          {prompts.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                const next = seed + 1;
                setSeed(next);
                generate(next);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Regenerate variations
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setIdea(example)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {example.slice(0, 38)}…
            </button>
          ))}
        </div>
      </section>

      {prompts.length === 0 ? (
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(PROMPT_TYPE_META).map(([type, meta]) => (
            <article key={type} className="panel space-y-2 p-5">
              <h2 className="font-display text-base font-semibold">{meta.label} prompt</h2>
              <p className="text-sm text-muted-foreground">{meta.blurb}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-10 space-y-5">
          <h2 className="font-display text-2xl font-semibold">Your prompt set</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {prompts.map((prompt) => (
              <article key={prompt.type} className="panel flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold">{prompt.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {PROMPT_TYPE_META[prompt.type].label}
                  </Badge>
                </div>
                <p className="whitespace-pre-line rounded-lg bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
                  {prompt.content}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copy(prompt)}>
                    {copied === prompt.type ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                  {signedIn ? (
                    <Button
                      size="sm"
                      onClick={() => save.mutate(prompt)}
                      disabled={save.isPending}
                    >
                      Save prompt
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <Link to="/auth">Sign in to save</Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
