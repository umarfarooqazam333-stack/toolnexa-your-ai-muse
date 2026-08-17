import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, Compass, Layers, Sparkles, Tag, Wand2 } from "lucide-react";

import { CONTACT_EMAIL } from "@/components/LegalPageShell";
import { Button } from "@/components/ui/button";

const TITLE = "About ToolNexa — Discover AI Tools. Create Better Prompts.";
const DESCRIPTION =
  "ToolNexa is a curated AI tools directory and prompt studio: browse tools by category, find free and freemium options, and turn one idea into six specialised prompts.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://toolnexa-ai-hub.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/about" }],
  }),
  component: AboutPage,
});

const capabilities = [
  {
    icon: Compass,
    title: "Discover useful AI tools",
    body: "A hand-checked directory of AI tools with short, honest summaries — no endless list of dead links.",
  },
  {
    icon: Layers,
    title: "Explore by category",
    body: "Image, video, writing, code, audio, design, research, marketing and productivity, each in its own place.",
  },
  {
    icon: Tag,
    title: "Find free and freemium options",
    body: "Filter for tools you can actually try without a card, and see pricing labels before you click through.",
  },
  {
    icon: Bookmark,
    title: "Compare and save",
    body: "Open a tool page to read what it does well, then bookmark the shortlist to your account.",
  },
  {
    icon: Wand2,
    title: "One idea, six prompts",
    body: "The Prompt Studio expands a simple idea into Image, Video, Thumbnail, Character, Anime and Realistic prompts.",
  },
  {
    icon: Sparkles,
    title: "Keep what works",
    body: "Save prompts you like and come back to them, so a good phrasing is never lost in a chat window.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Discover AI Tools. Create Better Prompts.
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          About ToolNexa
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          ToolNexa is an independent AI tools finder and prompt studio. It exists because
          finding the right AI tool has become harder than using one — and because a good
          result usually depends less on the tool than on how the prompt is written.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map(({ icon: Icon, title, body }) => (
          <section key={title} className="panel p-6">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      <section className="panel mt-10 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-foreground">Our mission</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The goal is simple: help people spend less time hunting for AI tools and more
            time doing the work. That means clear categories, plain-language descriptions,
            visible pricing labels, and links that go straight to the official website of
            each tool.
          </p>
          <p>
            The Prompt Studio follows the same idea. Instead of asking you to learn prompt
            engineering, it takes one plain description and structures it into six
            purpose-built variations, so you can copy the one that fits the tool you are
            using.
          </p>
          <p>
            ToolNexa is not affiliated with the tools it lists, and a listing is never an
            endorsement or a paid placement. Tool details are compiled from public sources
            and can change quickly, so we welcome corrections — that feedback is what keeps
            the directory trustworthy.
          </p>
        </div>
      </section>

      <section className="panel mt-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Corrections, suggestions or questions are genuinely useful. Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or use the contact page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/tools" search={{ q: "", free: false }}>
              Browse AI tools
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/prompt-studio">Open Prompt Studio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
