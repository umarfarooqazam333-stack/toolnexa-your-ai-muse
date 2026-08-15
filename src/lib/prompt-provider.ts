/**
 * Prompt provider abstraction.
 *
 * The app ships with the local rule-based engine and requires no API key.
 * To plug in a real LLM later, implement this interface and return it from
 * resolvePromptProvider() when the matching env var is present.
 *
 * Integration point (server-side only):
 *   PROMPT_PROVIDER = "openai" | "gemini"
 *   PROMPT_PROVIDER_API_KEY = <secret>
 *   PROMPT_PROVIDER_BASE_URL = optional OpenAI-compatible base URL
 *   PROMPT_PROVIDER_MODEL = optional model id
 */

import type { GeneratedPrompt, PromptType } from "./prompt-engine";
import { generateAllPrompts, generatePrompt } from "./prompt-engine";

export interface PromptProvider {
  id: string;
  generateOne(idea: string, type: PromptType, seed: number): Promise<GeneratedPrompt>;
  generateAll(idea: string, seed: number): Promise<GeneratedPrompt[]>;
}

export const localPromptProvider: PromptProvider = {
  id: "local-engine",
  async generateOne(idea, type, seed) {
    return generatePrompt(idea, type, seed);
  },
  async generateAll(idea, seed) {
    return generateAllPrompts(idea, seed);
  },
};

/**
 * Returns the configured provider. Today this always resolves to the local
 * engine; add a remote implementation here without touching any UI code.
 */
export function resolvePromptProvider(): PromptProvider {
  // Example of the future wiring, kept intentionally inert:
  // const key = process.env['PROMPT_PROVIDER_API_KEY'];
  // if (key) return createOpenAiCompatibleProvider(key);
  return localPromptProvider;
}
