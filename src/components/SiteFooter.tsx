import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            ToolNexa helps you find the right AI tool and turn one idea into six
            production-ready prompts.
          </p>
        </div>

        <nav className="space-y-2 text-sm">
          <h2 className="font-display text-sm font-semibold text-foreground">Discover</h2>
          <Link
            to="/tools"
            search={{ q: "", free: false }}
            className="block text-muted-foreground hover:text-foreground"
          >
            All AI Tools
          </Link>
          <Link to="/categories" className="block text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          <Link
            to="/tools"
            search={{ q: "", free: true }}
            className="block text-muted-foreground hover:text-foreground"
          >
            Free AI Tools
          </Link>
        </nav>

        <nav className="space-y-2 text-sm">
          <h2 className="font-display text-sm font-semibold text-foreground">Create</h2>
          <Link to="/prompt-studio" className="block text-muted-foreground hover:text-foreground">
            Prompt Studio
          </Link>
          <Link to="/my-prompts" className="block text-muted-foreground hover:text-foreground">
            My Prompts
          </Link>
          <Link to="/saved" className="block text-muted-foreground hover:text-foreground">
            Saved Tools
          </Link>
        </nav>

        <nav className="space-y-2 text-sm">
          <h2 className="font-display text-sm font-semibold text-foreground">Company</h2>
          <Link to="/about" className="block text-muted-foreground hover:text-foreground">
            About Us
          </Link>
          <Link to="/contact" className="block text-muted-foreground hover:text-foreground">
            Contact Us
          </Link>
          <Link to="/privacy" className="block text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="block text-muted-foreground hover:text-foreground">
            Terms &amp; Conditions
          </Link>
          <Link to="/auth" className="block text-muted-foreground hover:text-foreground">
            Sign in / Create account
          </Link>
        </nav>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ToolNexa. Tool data is curated from public sources.
      </div>
    </footer>
  );
}
