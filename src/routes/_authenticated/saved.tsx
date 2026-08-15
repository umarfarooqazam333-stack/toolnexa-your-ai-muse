import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSavedTools, toggleSavedTool } from "@/lib/user.functions";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved AI Tools — Your ToolNexa Library" },
      {
        name: "description",
        content: "Every AI tool you've saved to your ToolNexa library, in one place.",
      },
      { property: "og:title", content: "Saved AI Tools | ToolNexa" },
      { property: "og:description", content: "Your personal AI tool library." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const queryClient = useQueryClient();
  const saved = useQuery({ queryKey: ["saved-tools"], queryFn: () => getSavedTools() });

  const toggle = useMutation({
    mutationFn: (toolId: string) => toggleSavedTool({ data: { toolId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-tools"] });
      queryClient.invalidateQueries({ queryKey: ["saved-tool-ids"] });
      toast.success("Removed from saved");
    },
    onError: () => toast.error("Could not update your library"),
  });

  const rows = (saved.data ?? []).filter((row) => row.tool);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Saved tools</h1>
        <p className="mt-2 text-muted-foreground">Your personal AI tool shortlist.</p>
      </header>

      {saved.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="font-display text-lg font-semibold">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the directory and tap the bookmark on any tool.
          </p>
          <Button asChild className="mt-6">
            <Link to="/tools" search={{ q: "", free: false }}>
              Browse AI tools
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <ToolCard
              key={row.savedId}
              tool={row.tool}
              saved
              onToggleSave={(id) => toggle.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
