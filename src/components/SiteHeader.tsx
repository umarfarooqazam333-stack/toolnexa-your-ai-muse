import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/tools", label: "Tools" },
  { to: "/prompt-studio", label: "Prompt Studio" },
  { to: "/categories", label: "Categories" },
  { to: "/tools/free-ai-tools", label: "Free AI Tools" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/tools", search: { q: term || undefined } as never });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search AI tools..."
              aria-label="Search AI tools"
              className="h-9 bg-surface pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/saved">Saved</Link>
          </Button>
          {email ? (
            <Button asChild size="sm">
              <Link to="/my-prompts">My Prompts</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Login</Link>
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto w-full max-w-7xl space-y-3 px-4 py-4">
          <form onSubmit={submit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search AI tools..."
                aria-label="Search AI tools"
                className="bg-surface pl-9"
              />
            </div>
          </form>
          <nav className="grid gap-1">
            {[...NAV, { to: "/saved", label: "Saved" }].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
