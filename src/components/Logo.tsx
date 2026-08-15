import { Link } from "@tanstack/react-router";

import mark from "@/assets/toolnexa-mark.png";
import { cn } from "@/lib/utils";

type Variant = "full" | "compact" | "icon";

interface LogoProps {
  variant?: Variant;
  className?: string;
  linkTo?: string | null;
}

const SIZES: Record<Variant, string> = {
  full: "h-9 w-9",
  compact: "h-8 w-8",
  icon: "h-8 w-8",
};

export function Logo({ variant = "full", className, linkTo = "/" }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-lg border border-border bg-surface p-1.5",
          SIZES[variant],
        )}
      >
        <img
          src={mark}
          alt="ToolNexa logo"
          width={1024}
          height={1024}
          className="h-full w-full object-contain"
        />
      </span>
      {variant !== "icon" && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          {variant === "compact" ? (
            <>
              Tool<span className="text-primary">N</span>
            </>
          ) : (
            <>
              Tool<span className="text-primary">Nexa</span>
            </>
          )}
        </span>
      )}
    </span>
  );

  if (!linkTo) return content;
  return (
    <Link to={linkTo} className="shrink-0 transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
