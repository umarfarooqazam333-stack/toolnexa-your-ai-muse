import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deletePrompt, listPrompts } from "@/lib/user.functions";

export const Route = createFileRoute("/_authenticated/my-prompts")({
  head: () => ({
    meta: [
      { title: "My Prompts — Saved Prompt Sets | ToolNexa" },
      {
        name: "description",
        content: "Every prompt set you've generated and saved in ToolNexa Prompt Studio.",
      },
      { property: "og:title", content: "My Prompts | ToolNexa" },
      { property: "og:description", content: "Your saved AI prompt library." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyPromptsPage,
});

function MyPromptsPage() {
  const queryClient = useQueryClient();
  const prompts = useQuery({
    queryKey: ["prompts"],
    queryFn: () => listPrompts({ data: { q: "", type: "" } }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePrompt({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt deleted");
    },
    onError: () => toast.error("Could not delete that prompt"),
  });

  const rows = prompts.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">My prompts</h1>
        <p className="mt-2 text-muted-foreground">
          Prompt sets you saved from Prompt Studio.
        </p>
      </header>

      {prompts.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="font-display text-lg font-semibold">No saved prompts yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate a set in Prompt Studio and save the ones you like.
          </p>
          <Button asChild className="mt-6">
            <Link to="/prompt-studio">Open Prompt Studio</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((prompt) => (
            <li key={prompt.id} className="panel space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold">
                  {prompt.title ?? prompt.idea}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {prompt.prompt_type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete prompt"
                    onClick={() => remove.mutate(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-line rounded-lg bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
                {prompt.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
