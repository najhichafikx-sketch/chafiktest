const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

const PLATFORM_KEYS = ['etsy', 'amazon_kdp', 'gumroad', 'tpt', 'creative_fabrica'];

const PLATFORM_META = {
  etsy: { name: 'Etsy', emoji: '🛍️', color: '#F56400' },
  amazon_kdp: { name: 'Amazon KDP', emoji: '📚', color: '#FF9900' },
  gumroad: { name: 'Gumroad', emoji: '💸', color: '#FF90E8' },
  tpt: { name: 'TPT', emoji: '🎓', color: '#00B4D8' },
  creative_fabrica: { name: 'Creative Fabrica', emoji: '🎨', color: '#5C2D91' }
};

export const LISTING_PLATFORMS = PLATFORM_META;

export const LISTING_SYSTEM_PROMPT = `You are an expert e-commerce SEO strategist and AI product marketing specialist.

Your job is to generate HIGH-CONVERTING listings for multiple platforms in ONE shot.

RULES:
- Each platform has different SEO behavior — optimize for that platform specifically
- Titles must be optimized for CTR and ranking (not generic)
- Descriptions must be persuasive and sales-driven (not filler text)
- Keywords must be SEO-optimized and niche-relevant (no stuffing)
- Image prompts must be optimized for AI image generators (Midjourney / DALL-E / Stable Diffusion)
- Avoid generic outputs — every field must be specific to the product
- Focus on digital products and online business niche
- Make outputs realistic and ready to publish
- Always return valid JSON only

PLATFORM-SPECIFIC RULES:

Etsy:
- Focus: digital downloads, templates, creators, small business
- Tone: friendly, emotional, benefit-driven
- Title: max 140 chars, primary keyword first, include 1-2 secondary keywords
- Keywords: exactly 13 tags, all lowercase, no commas within tag phrases, long-tail mix
- Description: story-driven, benefit-led, mention "instant download", soft CTA

Amazon KDP:
- Focus: books, planners, journals, low-content
- Tone: professional, structured, authority-based
- Title: include book type, audience, and 1 main benefit (under 200 chars)
- Keywords: exactly 7 backend keyword phrases (no commas in single phrase)
- Description: A+ content style with key features and bullet points

Gumroad:
- Focus: AI tools, digital products, automation
- Tone: startup, high-value, tech-savvy
- Title: short, punchy, value-driven (max 80 chars)
- Description: feature-led with clear value prop, social proof angle, strong CTA
- Keywords: 5-8 tags focused on AI/digital/maker audience

TPT (Teachers Pay Teachers):
- Focus: teachers, education, worksheets, printables
- Tone: simple, educational, clear
- Title: include grade level and subject area
- Description: standards-aligned, learning outcomes, usage instructions
- Keywords: 6-10 tags covering grade, subject, type, season

Creative Fabrica:
- Focus: SVG, PNG, design assets, POD, fonts
- Tone: design-oriented, commercial use
- Title: include file types and use cases
- Description: licensing info, file specs, use cases, design style
- Keywords: 8-12 tags covering design style, file type, use case

IMAGE PROMPT RULES (for ALL platforms):
Each image_prompt MUST:
- Be optimized for AI image generation (Midjourney / DALL-E syntax)
- Include style (e.g. "ultra realistic", "3D mockup", "isometric")
- Include lighting (e.g. "soft natural light", "studio lighting")
- Include composition (e.g. "centered subject", "rule of thirds")
- Include commercial product visualization
- Include modern digital aesthetic
- Be suitable for thumbnails and marketing
- Be 1-3 sentences max

Example:
"Ultra realistic digital product mockup on clean modern desk, soft natural lighting, minimalist aesthetic, high contrast, 4k, professional marketing hero"

OUTPUT FORMAT:
Return ONLY a valid JSON object with this EXACT structure. No markdown fences. No commentary outside the JSON.

{
  "product_name": "<echo the input product name>",
  "platforms": {
    "etsy": {
      "title": "<etsy-optimized title>",
      "description": "<etsy description>",
      "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13"],
      "image_prompt": "<midjourney/dalle style prompt>"
    },
    "amazon_kdp": {
      "title": "<kdp-optimized title>",
      "description": "<kdp description>",
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7"],
      "image_prompt": "<prompt>"
    },
    "gumroad": {
      "title": "<gumroad-optimized title>",
      "description": "<gumroad description>",
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6"],
      "image_prompt": "<prompt>"
    },
    "tpt": {
      "title": "<tpt-optimized title>",
      "description": "<tpt description>",
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8"],
      "image_prompt": "<prompt>"
    },
    "creative_fabrica": {
      "title": "<cf-optimized title>",
      "description": "<cf description>",
      "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"],
      "image_prompt": "<prompt>"
    }
  }
}`;

export function buildListingPrompt(productName) {
  return `Generate platform-specific listings for this digital product:

Product Name: "${productName.trim()}"

Return ONLY a valid JSON object with the EXACT structure from your system instructions. No markdown. No commentary. No explanation outside JSON.`;
}

export function getListingCacheKey(productName) {
  const norm = String(productName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return 'listing:' + Buffer.from(norm).toString('base64').slice(0, 40);
}

export function getCachedListing(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedListing(key, value) {
  cache.set(key, { value, ts: Date.now() });
}

function asString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map(k => asString(k))
    .filter(Boolean)
    .slice(0, 30);
}

function validatePlatformData(p, key) {
  if (!p || typeof p !== 'object') {
    return { ok: false, reason: `Missing or invalid data for platform '${key}'` };
  }
  const title = asString(p.title);
  const description = asString(p.description);
  const keywords = asStringArray(p.keywords);
  const image_prompt = asString(p.image_prompt);

  if (!title) return { ok: false, reason: `Platform '${key}' missing title` };
  if (!description) return { ok: false, reason: `Platform '${key}' missing description` };
  if (keywords.length < 3) return { ok: false, reason: `Platform '${key}' has too few keywords (${keywords.length})` };
  if (!image_prompt) return { ok: false, reason: `Platform '${key}' missing image_prompt` };

  return {
    ok: true,
    value: { title, description, keywords, image_prompt }
  };
}

export function validateListingResponse(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: 'AI response is not a JSON object' };
  }
  if (!parsed.platforms || typeof parsed.platforms !== 'object') {
    return { ok: false, reason: 'AI response missing "platforms" object' };
  }
  const cleaned = {
    product_name: asString(parsed.product_name) || '',
    platforms: {}
  };
  for (const key of PLATFORM_KEYS) {
    const result = validatePlatformData(parsed.platforms[key], key);
    if (!result.ok) return result;
    cleaned.platforms[key] = result.value;
  }
  if (!cleaned.product_name) {
    cleaned.product_name = '';
  }
  return { ok: true, value: cleaned };
}

export function parseAIResponseText(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

export function isValidProductName(name) {
  if (!name || typeof name !== 'string') return false;
  const t = name.trim();
  return t.length >= 2 && t.length <= 200;
}

export default {
  LISTING_SYSTEM_PROMPT,
  LISTING_PLATFORMS,
  buildListingPrompt,
  getListingCacheKey,
  getCachedListing,
  setCachedListing,
  validateListingResponse,
  parseAIResponseText,
  isValidProductName
};
