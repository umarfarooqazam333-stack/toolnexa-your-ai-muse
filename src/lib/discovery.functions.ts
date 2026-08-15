import { createServerFn } from "@tanstack/react-start";

/**
 * Live AI tool discovery.
 *
 * This is the integration point for a real search provider (Brave Search,
 * SerpAPI, Bing, Exa, ...). Nothing is faked: with no provider configured the
 * endpoint reports that discovery is not configured, and the UI says so.
 *
 * To enable, set these server-side secrets and implement the fetch below:
 *   DISCOVERY_PROVIDER   = "brave" | "serpapi" | "exa"
 *   DISCOVERY_API_KEY    = <secret>
 *
 * Discovered tools are written to public.discovered_tools with status
 * DISCOVERED and follow the review workflow:
 *   DISCOVERED -> PENDING_REVIEW -> APPROVED -> PUBLISHED (or REJECTED)
 * They never appear in the public directory until an admin publishes them.
 */

export interface DiscoveryResult {
  configured: boolean;
  message: string;
  results: Array<{ name: string; url: string; snippet: string }>;
}

export const discoverTools = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ({ query: String((data as any)?.query ?? "").slice(0, 160) }))
  .handler(async (): Promise<DiscoveryResult> => {
    const provider = process.env["DISCOVERY_PROVIDER"];
    const apiKey = process.env["DISCOVERY_API_KEY"];

    if (!provider || !apiKey) {
      return {
        configured: false,
        message: "Live tool discovery is not configured yet.",
        results: [],
      };
    }

    // Implement the provider call here, then stage rows in discovered_tools.
    return {
      configured: false,
      message: "Live tool discovery is not configured yet.",
      results: [],
    };
  });
