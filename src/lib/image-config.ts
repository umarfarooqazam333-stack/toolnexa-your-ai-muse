/**
 * Central configuration for the ToolNexa image generator.
 * Change CREDIT_COST_PER_IMAGE here to re-price generation without touching the UI.
 */
export const CREDIT_COST_PER_IMAGE = 1;

export const MAX_IMAGES_PER_BATCH = 5;

export const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;

export function creditCostFor(count: number) {
  return Math.max(0, Math.round(count)) * CREDIT_COST_PER_IMAGE;
}

export type StylePresetId =
  | "none"
  | "anime"
  | "realistic"
  | "cinematic"
  | "cartoon"
  | "3d"
  | "fantasy"
  | "sci-fi"
  | "illustration"
  | "product"
  | "thumbnail";

export const STYLE_PRESETS: {
  id: StylePresetId;
  label: string;
  /** Appended to the user prompt. Empty for "Custom / None". */
  modifier: string;
}[] = [
  { id: "none", label: "Custom / None", modifier: "" },
  {
    id: "anime",
    label: "Anime",
    modifier:
      "anime style, clean line art, vibrant cel shading, expressive eyes, detailed background, high quality anime illustration",
  },
  {
    id: "realistic",
    label: "Realistic",
    modifier:
      "photorealistic, shot on full-frame camera, 50mm lens, natural lighting, ultra detailed skin and texture, sharp focus",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    modifier:
      "cinematic film still, dramatic volumetric lighting, anamorphic lens, shallow depth of field, colour graded, 2.39:1 mood",
  },
  {
    id: "cartoon",
    label: "Cartoon",
    modifier:
      "cartoon style, bold outlines, flat bright colours, playful exaggerated proportions, clean vector-like shapes",
  },
  {
    id: "3d",
    label: "3D Render",
    modifier:
      "3D render, octane style global illumination, soft studio lighting, subsurface scattering, high-poly detail, 4k",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    modifier:
      "epic fantasy concept art, magical atmosphere, painterly detail, glowing rim light, richly detailed environment",
  },
  {
    id: "sci-fi",
    label: "Sci-Fi",
    modifier:
      "science fiction concept art, futuristic technology, neon accents, atmospheric haze, highly detailed hard-surface design",
  },
  {
    id: "illustration",
    label: "Illustration",
    modifier:
      "digital illustration, hand-drawn texture, harmonious colour palette, editorial composition, fine detail",
  },
  {
    id: "product",
    label: "Product",
    modifier:
      "professional product photography, seamless studio backdrop, soft box lighting, crisp reflections, commercial quality",
  },
  {
    id: "thumbnail",
    label: "YouTube Thumbnail",
    modifier:
      "bold YouTube thumbnail composition, high contrast subject, punchy saturated colours, dramatic lighting, clear focal point, space for large text",
  },
];

export const STYLE_MODIFIERS: Record<string, string> = Object.fromEntries(
  STYLE_PRESETS.map((preset) => [preset.id, preset.modifier]),
);

export type AspectRatioId = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export const ASPECT_RATIOS: {
  id: AspectRatioId;
  label: string;
  width: number;
  height: number;
}[] = [
  { id: "1:1", label: "1:1 Square", width: 1024, height: 1024 },
  { id: "16:9", label: "16:9 Wide", width: 1024, height: 576 },
  { id: "9:16", label: "9:16 Vertical", width: 576, height: 1024 },
  { id: "4:3", label: "4:3 Classic", width: 1024, height: 768 },
  { id: "3:4", label: "3:4 Portrait", width: 768, height: 1024 },
];

export const ASPECT_RATIO_MAP = Object.fromEntries(
  ASPECT_RATIOS.map((ratio) => [ratio.id, ratio]),
) as Record<AspectRatioId, (typeof ASPECT_RATIOS)[number]>;

export const ACCEPTED_REFERENCE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_REFERENCE_BYTES = 6 * 1024 * 1024;

export function buildFinalPrompt(prompt: string, styleId: string) {
  const modifier = STYLE_MODIFIERS[styleId] ?? "";
  return modifier ? `${prompt.trim()} — ${modifier}` : prompt.trim();
}
