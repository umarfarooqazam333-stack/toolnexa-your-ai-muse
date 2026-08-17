import type { ReactNode } from "react";

export function LegalPageShell({
  title,
  intro,
  lastUpdated,
  children,
}: {
  title: string;
  intro: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        {lastUpdated && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Last updated: {lastUpdated}
          </p>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>
      </header>
      <div className="mt-10 space-y-5">{children}</div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="panel p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-foreground">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_li]:leading-relaxed [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export const CONTACT_EMAIL = "umarfarooq.azam333@gmail.com";
