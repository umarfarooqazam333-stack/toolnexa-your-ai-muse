import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, LogOut, Menu, Search, Sparkles, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const linkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

export function SiteHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    navigate({ to: "/tools", search: { q: term, free: false } });
  }

  async function handleSignOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    setEmail(null);
    toast.success("You're signed out");
    navigate({ to: "/", replace: true });
  }

  function Nav({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        <Link
          to="/tools"
          search={{ q: "", free: false }}
          className={linkClass}
          activeProps={{ className: "text-foreground bg-surface" }}
          onClick={onNavigate}
        >
          Tools
        </Link>
        <Link
          to="/prompt-studio"
          className={linkClass}
          activeProps={{ className: "text-foreground bg-surface" }}
          onClick={onNavigate}
        >
          Prompt Studio
        </Link>
        <Link
          to="/categories"
          className={linkClass}
          activeProps={{ className: "text-foreground bg-surface" }}
          onClick={onNavigate}
        >
          Categories
        </Link>
        <Link
          to="/tools"
          search={{ q: "", free: true }}
          className={linkClass}
          onClick={onNavigate}
        >
          Free AI Tools
        </Link>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <Nav />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[140px] truncate sm:inline">{email}</span>
                  <span className="sm:hidden">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/my-prompts" className="cursor-pointer gap-2">
                    <Sparkles className="h-4 w-4" />
                    My Prompts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/saved" className="cursor-pointer gap-2">
                    <Bookmark className="h-4 w-4" />
                    Saved tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Nav onNavigate={() => setOpen(false)} />
            <Link to="/saved" className={linkClass} onClick={() => setOpen(false)}>
              Saved
            </Link>
            {email ? (
              <>
                <Link to="/my-prompts" className={linkClass} onClick={() => setOpen(false)}>
                  My Prompts
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className={cn(linkClass, "flex items-center gap-2 text-left")}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link to="/auth" className={linkClass} onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
