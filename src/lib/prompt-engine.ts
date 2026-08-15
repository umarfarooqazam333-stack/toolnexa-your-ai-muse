/**
 * ToolNexa local prompt engine.
 *
 * Rule/template based. No GPU, no external API, no network call. It analyses a
 * plain idea and expands it into six structured, specialised prompts.
 *
 * An optional remote provider can be added later — see promptProvider() in
 * src/lib/prompt-provider.ts. When no provider is configured this engine runs.
 */

export const PROMPT_TYPES = [
  "image",
  "video",
  "thumbnail",
  "character",
  "anime",
  "realistic",
] as const;

export type PromptType = (typeof PROMPT_TYPES)[number];

export const PROMPT_TYPE_META: Record<
  PromptType,
  { label: string; blurb: string }
> = {
  image: { label: "Image", blurb: "Still image generators (Midjourney, SDXL, Firefly)" },
  video: { label: "Video", blurb: "Text-to-video models (Runway, Pika, Kling)" },
  thumbnail: { label: "Thumbnail", blurb: "High-CTR YouTube thumbnail art" },
  character: { label: "Character", blurb: "Consistent character sheets & references" },
  anime: { label: "Anime", blurb: "Stylised anime / illustration rendering" },
  realistic: { label: "Realistic", blurb: "Photoreal, camera-accurate output" },
};

export interface GeneratedPrompt {
  type: PromptType;
  label: string;
  content: string;
}

/* ------------------------------------------------------------------ */
/* Idea analysis                                                       */
/* ------------------------------------------------------------------ */

interface Analysis {
  idea: string;
  subjects: string[];
  environment: string;
  action: string;
  timeOfDay: string;
  mood: string;
  isThumbnailIntent: boolean;
  isAnimeIntent: boolean;
  isRealisticIntent: boolean;
  aspect: string;
}

const ENVIRONMENTS: Array<[RegExp, string]> = [
  [/\b(forest|jungle|woods|woodland)\b/i, "a dense sunlit forest with layered undergrowth and tall trees"],
  [/\b(desert|dune|sahara)\b/i, "a vast desert of rolling dunes and heat haze"],
  [/\b(ocean|sea|beach|coast|underwater)\b/i, "an open coastline with breaking waves and salt spray"],
  [/\b(city|urban|street|downtown|metropolis)\b/i, "a dense modern city street with signage and reflective glass"],
  [/\b(space|galaxy|planet|orbit|nebula)\b/i, "deep space with distant nebulae and starlight"],
  [/\b(mountain|alps|peak|valley)\b/i, "a high mountain range with mist rolling through the valley"],
  [/\b(office|studio|desk|workspace)\b/i, "a clean modern interior workspace with soft window light"],
  [/\b(snow|winter|ice|arctic)\b/i, "a snow-covered landscape under a pale winter sky"],
  [/\b(kitchen|cafe|restaurant|bar)\b/i, "a warm interior cafe setting with practical lighting"],
  [/\b(school|classroom|library|campus)\b/i, "a bright classroom interior with natural light"],
];

const ACTIONS: Array<[RegExp, string]> = [
  [/\b(friend|friends|friendship|becoming friends|together)\b/i, "sharing a calm, trusting moment together"],
  [/\b(fight|battle|versus|vs|war)\b/i, "locked in a tense confrontation"],
  [/\b(run|running|chase|racing)\b/i, "in fast forward motion, mid-stride"],
  [/\b(fly|flying|soar)\b/i, "in flight, suspended mid-air"],
  [/\b(sit|sitting|resting|sleep)\b/i, "resting still and relaxed"],
  [/\b(talk|talking|conversation|meeting)\b/i, "interacting and communicating with each other"],
  [/\b(danc|sing|perform)\b/i, "performing energetically"],
  [/\b(work|coding|typing|building)\b/i, "focused and working intently"],
];

const MOODS: Array<[RegExp, string]> = [
  [/\b(friend|heartwarming|wholesome|cute|peaceful|calm)\b/i, "warm, heartfelt and peaceful"],
  [/\b(dark|horror|scary|creepy)\b/i, "dark, tense and ominous"],
  [/\b(epic|cinematic|dramatic|legend)\b/i, "epic and cinematic"],
  [/\b(fun|funny|comedy|playful)\b/i, "playful and lighthearted"],
  [/\b(luxury|premium|elegant)\b/i, "refined, premium and elegant"],
  [/\b(futuristic|cyberpunk|sci-?fi|tech)\b/i, "futuristic and high-tech"],
];

const ANIMALS =
  /\b(lion|rabbit|tiger|wolf|fox|bear|dog|cat|eagle|horse|elephant|dragon|panda|deer|owl|shark|whale|monkey|snake)s?\b/gi;
const PEOPLE =
  /\b(man|woman|boy|girl|child|kid|astronaut|warrior|knight|wizard|robot|samurai|detective|teacher|student|chef|athlete|dancer|singer|developer|scientist)s?\b/gi;

function unique(list: string[]): string[] {
  return Array.from(new Set(list.map((s) => s.toLowerCase().trim()))).filter(Boolean);
}

function matchFirst(idea: string, table: Array<[RegExp, string]>, fallback: string): string {
  for (const [re, value] of table) if (re.test(idea)) return value;
  return fallback;
}

export function analyseIdea(rawIdea: string): Analysis {
  const idea = rawIdea.trim().replace(/\s+/g, " ");
  const subjects = unique([
    ...(idea.match(ANIMALS) ?? []),
    ...(idea.match(PEOPLE) ?? []),
  ]);

  const timeOfDay = /\b(night|midnight|nocturnal)\b/i.test(idea)
    ? "night"
    : /\b(sunset|dusk|golden hour)\b/i.test(idea)
      ? "golden hour"
      : /\b(sunrise|dawn|morning)\b/i.test(idea)
        ? "early morning"
        : "late afternoon";

  return {
    idea,
    subjects,
    environment: matchFirst(idea, ENVIRONMENTS, "an environment that fits the described scene naturally"),
    action: matchFirst(idea, ACTIONS, "positioned naturally within the scene, clearly readable"),
    timeOfDay,
    mood: matchFirst(idea, MOODS, "grounded and believable"),
    isThumbnailIntent: /\b(youtube|thumbnail|clickbait|channel)\b/i.test(idea),
    isAnimeIntent: /\b(anime|manga|ghibli|cartoon|illustrated)\b/i.test(idea),
    isRealisticIntent: /\b(realistic|photoreal|photo|lifelike|real)\b/i.test(idea),
    aspect: /\b(portrait|vertical|shorts|reel|tiktok|story)\b/i.test(idea)
      ? "9:16"
      : /\b(square|instagram post)\b/i.test(idea)
        ? "1:1"
        : "16:9",
  };
}

function subjectPhrase(a: Analysis): string {
  if (a.subjects.length === 0) return "the main subject described in the idea";
  if (a.subjects.length === 1) return `a ${a.subjects[0]}`;
  const last = a.subjects[a.subjects.length - 1];
  return `${a.subjects.slice(0, -1).map((s) => `a ${s}`).join(", ")} and a ${last}`;
}

/* ------------------------------------------------------------------ */
/* Variation pools (used by Regenerate)                                */
/* ------------------------------------------------------------------ */

const POOL = {
  composition: [
    "rule-of-thirds composition with clear foreground, midground and background separation",
    "centered hero composition with symmetrical framing and breathing room",
    "low-angle composition that makes the subjects feel monumental",
    "wide establishing composition with the subjects placed off-centre",
  ],
  camera: [
    "85mm lens, f/1.8, shallow depth of field, subject-plane focus",
    "35mm lens, f/4, natural perspective, deep focus",
    "50mm lens, f/2.2, eye-level camera, slight subject compression",
    "24mm wide lens, f/5.6, expansive scene coverage, minimal distortion",
  ],
  lighting: [
    "soft directional god-rays filtering through the scene, warm rim light on the subjects",
    "diffused overcast light, gentle shadow falloff, balanced exposure",
    "dramatic side key light with deep but detailed shadows",
    "warm backlight with cool ambient fill for natural colour separation",
  ],
  colour: [
    "warm amber and deep green palette with natural saturation",
    "teal and orange cinematic grade, controlled contrast",
    "muted earth tones with one saturated accent colour",
    "cool blue ambience with warm practical highlights",
  ],
  motion: [
    "slow dolly-in toward the subjects, steady and smooth",
    "gentle handheld drift with subtle parallax",
    "slow orbiting crane move around the subjects",
    "static locked-off shot with movement only inside the frame",
  ],
  detail: [
    "high micro-detail: fur strands, skin texture, fabric weave, surface imperfections",
    "crisp textural detail with realistic material response and no plastic sheen",
    "fine detail in the focal plane, softly falling off toward the edges",
  ],
} as const;

function pick<T>(pool: readonly T[], seed: number, offset: number): T {
  return pool[Math.abs(seed + offset * 7) % pool.length] as T;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

function block(rows: Array<[string, string]>): string {
  return rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

function buildImage(a: Analysis, s: number): string {
  return [
    `${subjectPhrase(a)} in ${a.environment}, ${a.action}. Faithful to the original idea: "${a.idea}".`,
    "",
    block([
      ["Subject", subjectPhrase(a)],
      ["Environment", a.environment],
      ["Action", a.action],
      ["Composition", pick(POOL.composition, s, 1)],
      ["Camera", pick(POOL.camera, s, 2)],
      ["Lighting", `${pick(POOL.lighting, s, 3)}, ${a.timeOfDay} light`],
      ["Mood", a.mood],
      ["Colour", pick(POOL.colour, s, 4)],
      ["Detail", pick(POOL.detail, s, 5)],
      ["Quality", "highly detailed, sharp focus, professional finish, 8k render quality"],
      ["Aspect ratio", a.aspect],
      ["Avoid", "extra limbs, warped anatomy, watermarks, text artefacts, blurry edges, oversaturation"],
    ]),
  ].join("\n");
}

function buildVideo(a: Analysis, s: number): string {
  return [
    `Cinematic shot: ${subjectPhrase(a)} in ${a.environment}, ${a.action}. Original idea: "${a.idea}".`,
    "",
    block([
      ["Shot type", pick(POOL.composition, s, 2)],
      ["Camera movement", pick(POOL.motion, s, 1)],
      ["Lens", pick(POOL.camera, s, 3)],
      ["Lighting", `${pick(POOL.lighting, s, 4)}, ${a.timeOfDay}`],
      ["Action beats", `1) establish the scene 2) ${a.action} 3) hold on the subjects' reaction`],
      ["Mood", a.mood],
      ["Colour grade", pick(POOL.colour, s, 5)],
      ["Duration", "5-8 seconds, single continuous take"],
      ["Frame rate", "24 fps, cinematic motion blur"],
      ["Aspect ratio", a.aspect],
      ["Audio direction", "natural ambience only, no dialogue"],
      ["Avoid", "morphing subjects, flickering textures, sudden cuts, on-screen text"],
    ]),
  ].join("\n");
}

function buildThumbnail(a: Analysis, s: number): string {
  return [
    `YouTube thumbnail artwork: ${subjectPhrase(a)} in ${a.environment}, ${a.action}. Built from the idea: "${a.idea}".`,
    "",
    block([
      ["Primary focus", `${subjectPhrase(a)}, large in frame, faces and eyes clearly visible`],
      ["Composition", "subjects pushed to one third of the frame, clean negative space on the opposite side for a title overlay"],
      ["Expression", "strong, readable emotion that matches the video's promise"],
      ["Lighting", "high-contrast key light with a bright rim separating subjects from the background"],
      ["Colour", "bold saturated palette with strong subject/background separation for small-screen legibility"],
      ["Background", `${a.environment}, slightly blurred and darkened so the subjects pop`],
      ["Detail", pick(POOL.detail, s, 2)],
      ["Readability", "must stay clear at 320x180 px; avoid thin lines and busy clutter"],
      ["Aspect ratio", "16:9, 1280x720 minimum"],
      ["Text", "leave the text overlay area empty — add the title in an editor afterwards"],
      ["Avoid", "misspelled generated text, tiny details, muddy midtones, flat lighting"],
    ]),
  ].join("\n");
}

function buildCharacter(a: Analysis, s: number): string {
  const hero = a.subjects[0] ?? "the main character";
  return [
    `Character design sheet for ${hero}, taken from the idea: "${a.idea}".`,
    "",
    block([
      ["Character", hero],
      ["Appearance", "consistent silhouette, proportions, colour markings and distinguishing features described precisely so the design can be reproduced"],
      ["Expression set", "neutral, happy, alert, and one signature expression"],
      ["Pose set", "front view, three-quarter view, side view, plus one action pose"],
      ["Costume / markings", "keep every design element identical across all views"],
      ["Environment context", a.environment],
      ["Lighting", "flat, even studio lighting so design details stay readable"],
      ["Background", "plain neutral backdrop, no scene distractions"],
      ["Camera", pick(POOL.camera, s, 1)],
      ["Detail", pick(POOL.detail, s, 3)],
      ["Consistency note", "reuse this exact description as a reference prompt for every future shot of this character"],
      ["Aspect ratio", "1:1 for the sheet, 2:3 for single portraits"],
      ["Avoid", "changing proportions between views, inconsistent colours, extra accessories"],
    ]),
  ].join("\n");
}

function buildAnime(a: Analysis, s: number): string {
  return [
    `Anime illustration: ${subjectPhrase(a)} in ${a.environment}, ${a.action}. Faithful to: "${a.idea}".`,
    "",
    block([
      ["Style", "modern cel-shaded anime illustration, clean confident linework, hand-painted background"],
      ["Subject", subjectPhrase(a)],
      ["Environment", `${a.environment}, painted in a soft illustrative style`],
      ["Composition", pick(POOL.composition, s, 3)],
      ["Lighting", "stylised rim light with bloom, expressive shadow shapes"],
      ["Colour", "vivid but harmonised anime palette, gentle gradients in the sky"],
      ["Mood", a.mood],
      ["Line & shading", "crisp outlines, two-tone cel shading, subtle screen-tone texture"],
      ["Detail", "expressive eyes, detailed background foliage, atmospheric particles"],
      ["Aspect ratio", a.aspect],
      ["Avoid", "3D render look, photographic textures, muddy colours, western cartoon proportions"],
    ]),
  ].join("\n");
}

function buildRealistic(a: Analysis, s: number): string {
  return [
    `Photorealistic photograph: ${subjectPhrase(a)} in ${a.environment}, ${a.action}. Faithful to: "${a.idea}".`,
    "",
    block([
      ["Realism target", "indistinguishable from a real photograph, physically plausible anatomy and scale"],
      ["Subject", subjectPhrase(a)],
      ["Environment", a.environment],
      ["Camera body", "full-frame mirrorless, RAW capture"],
      ["Lens & settings", pick(POOL.camera, s, 4)],
      ["Lighting", `natural ${a.timeOfDay} light, ${pick(POOL.lighting, s, 2)}`],
      ["Colour", pick(POOL.colour, s, 1)],
      ["Detail", pick(POOL.detail, s, 4)],
      ["Post", "neutral grade, realistic contrast curve, no HDR halos"],
      ["Mood", a.mood],
      ["Aspect ratio", a.aspect],
      ["Avoid", "illustration or CGI look, plastic skin or fur, over-sharpening, unrealistic lighting, watermarks"],
    ]),
  ].join("\n");
}

const BUILDERS: Record<PromptType, (a: Analysis, seed: number) => string> = {
  image: buildImage,
  video: buildVideo,
  thumbnail: buildThumbnail,
  character: buildCharacter,
  anime: buildAnime,
  realistic: buildRealistic,
};

export function generatePrompt(
  idea: string,
  type: PromptType,
  seed = 0,
): GeneratedPrompt {
  const analysis = analyseIdea(idea);
  return {
    type,
    label: PROMPT_TYPE_META[type].label,
    content: BUILDERS[type](analysis, seed),
  };
}

export function generateAllPrompts(idea: string, seed = 0): GeneratedPrompt[] {
  return PROMPT_TYPES.map((type) => generatePrompt(idea, type, seed));
}
