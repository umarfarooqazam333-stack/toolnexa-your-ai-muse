import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Mail } from "lucide-react";
import { useState } from "react";

import { CONTACT_EMAIL } from "@/components/LegalPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TITLE = "Contact ToolNexa — Feedback, Corrections & Questions";
const DESCRIPTION =
  "Contact ToolNexa about tool listing corrections, outdated pricing, broken links, feedback, partnership, privacy or terms questions.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://toolnexa-ai-hub.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/contact" }],
  }),
  component: ContactPage,
});

const reasons = [
  "General questions about ToolNexa",
  "Tool listing corrections",
  "Incorrect tool information",
  "Pricing or free-tier updates",
  "Broken or redirected links",
  "Feedback and feature suggestions",
  "Partnership inquiries",
  "Privacy questions",
  "Terms & Conditions questions",
  "Reporting inaccurate information",
];

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject || "ToolNexa enquiry",
  )}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`,
  )}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          We read every message
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Contact ToolNexa
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Whether a tool's pricing has changed, a link is broken, or you have an idea for the
          directory or the Prompt Studio, we'd like to hear it. Corrections help keep the
          listings accurate for everyone.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Email</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 break-all text-sm font-medium text-primary underline"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This is the only official contact channel for ToolNexa. Replies are sent from
              the same address.
            </p>
          </section>

          <section className="panel p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              What you can write about
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true" className="text-primary">
                    •
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="panel p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Send a message
          </h2>

          <div className="mt-4 flex gap-3 rounded-lg border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              <strong className="text-foreground">Email delivery is not configured yet.</strong>{" "}
              This form cannot send messages from the website. Fill it in and use the button
              below to open the message in your own email app, or write directly to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailtoHref;
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-medium text-foreground">
                Subject
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E.g. Pricing update for a listed tool"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's wrong, missing, or worth adding..."
                rows={7}
                required
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Open in my email app
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
