import { NextResponse } from 'next/server';
import { generateAIContent, getApiKey } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

const VALID_SECTIONS = ['rewrite', 'keywords', 'titles', 'hooks', 'script', 'description', 'tags', 'thumbnails', 'seo', 'ideas'];

const SECTION_LIMITS = {
  rewrite: 1800,
  keywords: 1200,
  titles: 1200,
  hooks: 1000,
  script: 3500,
  description: 1500,
  tags: 800,
  thumbnails: 1500,
  seo: 1500,
  ideas: 1500
};

const SYSTEM_PROMPTS = {
  rewrite: `You are an expert content rewriter. You rewrite text at a specified similarity percentage (the user picks 50-100%). At 100% the meaning is preserved while improving flow. At 50% the text is heavily paraphrased while keeping the core idea. Return ONLY a valid JSON object: {"rewritten": "<the rewritten text>"}. No markdown, no commentary outside JSON.`,
  keywords: `You are a YouTube SEO expert. Extract the 10-15 most important SEO keywords from the given video text. Return ONLY a valid JSON object: {"keywords": ["kw1","kw2",...,"kw15"]}. Focus on long-tail, niche-relevant, search-intent phrases. No markdown.`,
  titles: `You are a YouTube click-through-rate expert. Generate 3 title variations:
- 1 VIRAL (curiosity-driven, emotional, under 70 chars)
- 1 PROFESSIONAL (clear, informative, under 80 chars)
- 1 SEO-OPTIMIZED (keyword-rich, under 100 chars)
Return ONLY valid JSON: {"titles": [{"style":"viral","title":"..."},{"style":"professional","title":"..."},{"style":"seo","title":"..."}]}. No markdown.`,
  hooks: `You are a YouTube retention expert. Generate 3 viral intro hooks (first 5-10 seconds) for this video. Each hook should stop the scroll. Return ONLY valid JSON: {"hooks": [{"style":"question","text":"..."},{"style":"shock","text":"..."},{"style":"story","text":"..."}]}. No markdown.`,
  script: `You are a YouTube scriptwriter. Rewrite/generate a full video script from the source text with 3 sections:
1. INTRO HOOK (15-20 seconds)
2. MAIN CONTENT (well-structured, sub-sections if needed)
3. CALL TO ACTION (subscribe, like, comment)
Return ONLY valid JSON: {"script": {"intro":"...","main":"...","cta":"..."}}. No markdown.`,
  description: `You are a YouTube SEO expert. Write a fully optimized YouTube description with:
- Intro paragraph (2-3 sentences, hook the viewer)
- "In this video:" line with 3-5 key topics
- Timestamps placeholder (00:00 - Topic)
- 5-7 relevant hashtags at the end
Return ONLY valid JSON: {"description":"<full description>"}. No markdown.`,
  tags: `You are a YouTube SEO expert. Generate exactly 25 SEO-optimized tags for this video. Mix broad and long-tail. Return ONLY valid JSON: {"tags": ["tag1","tag2",...,"tag25"]}. No markdown.`,
  thumbnails: `You are a thumbnail design expert. Generate 3 detailed image prompts for AI image generators (Midjourney, DALL-E, Stable Diffusion). Each must specify: subject, style, lighting, composition, color palette, text overlay area. Return ONLY valid JSON: {"thumbnails": [{"style":"...","prompt":"..."},{"style":"...","prompt":"..."},{"style":"...","prompt":"..."}]}. No markdown.`,
  seo: `You are a YouTube SEO auditor. Given a YouTube video's title, description, and tags, score each from 0-100 and provide 1-2 actionable improvement tips per weak area. Return ONLY valid JSON: {"seo": {"title_score":N,"description_score":N,"tags_score":N,"overall_score":N,"tips":[{"area":"title","tip":"..."},{"area":"description","tip":"..."},{"area":"tags","tip":"..."}]}}. No markdown.`,
  ideas: `You are a YouTube content strategist. Based on the video topic, suggest 5 related video ideas that would perform well on the same channel. Each must have a title and 1-line description. Return ONLY valid JSON: {"ideas": [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}]}. No markdown.`
};

function safeJsonParse(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

function detectLanguage(text) {
  if (!text) return 'en';
  const sample = String(text).slice(0, 500);
  const hasArabic = /[\u0600-\u06FF]/.test(sample);
  return hasArabic ? 'ar' : 'en';
}

function buildUserPrompt(section, body, lang) {
  const { text, rewritePercent, meta } = body;
  const langNote = lang === 'ar' ? 'The user is Arabic-speaking — output should be in Arabic where the content is meant to be read by the audience (titles, hooks, descriptions, scripts, ideas). Keep technical/SEO terms and image prompts in English.' : 'Output in English unless the source text is clearly in another language.';

  const contextMeta = meta && (meta.title || meta.description)
    ? `\n\nExisting context (for SEO scoring):\n- Title: ${meta.title || 'n/a'}\n- Description: ${meta.description || 'n/a'}\n- Tags: ${(meta.tags || []).join(', ') || 'n/a'}`
    : '';

  switch (section) {
    case 'rewrite':
      return `Rewrite the following text at ${rewritePercent || 80}% similarity (preserve meaning, improve flow).\n\n${langNote}\n\nText:\n"""\n${text}\n"""`;
    case 'seo':
      return `${langNote}${contextMeta}\n\nSource text (for topic context):\n"""\n${text}\n"""`;
    default:
      return `${langNote}\n\nSource text (transcript or video content):\n"""\n${text}\n"""`;
  }
}

export async function POST(request) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured. Please set it in Admin Settings.' },
        { status: 503 }
      );
    }

    let body = {};
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const section = String(body.section || '').toLowerCase();
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` }, { status: 400 });
    }

    const text = String(body.text || '').trim();
    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'text is required (min 10 characters)' }, { status: 400 });
    }
    if (text.length > 30000) {
      return NextResponse.json({ error: 'text is too long (max 30000 characters). Try a shorter segment.' }, { status: 400 });
    }

    const lang = detectLanguage(text);
    const userPrompt = buildUserPrompt(section, body, lang);
    const systemPrompt = SYSTEM_PROMPTS[section];

    const startTs = Date.now();
    let result;
    try {
      result = await generateAIContent({
        prompt: userPrompt,
        systemPrompt,
        toolId: 'youtube-content-suite',
        maxTokens: SECTION_LIMITS[section],
        temperature: 0.8
      });
    } catch (aiErr) {
      const msg = aiErr?.message || 'AI service error';
      console.error('[youtube-content] AI error:', msg);
      const status = msg.includes('not configured') ? 503 : 502;
      return NextResponse.json(
        { error: msg.includes('not configured') ? msg : 'AI service is temporarily unavailable. Please try again.', retryable: true },
        { status }
      );
    }

    const parsed = safeJsonParse(result);
    if (!parsed) {
      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.', retryable: true },
        { status: 502 }
      );
    }

    const elapsed = Date.now() - startTs;
    return NextResponse.json({
      success: true,
      section,
      data: parsed,
      meta: { lang, elapsed_ms: elapsed, model: 'youtube-content-suite' }
    });
  } catch (err) {
    console.error('[youtube-content] route error:', err);
    return NextResponse.json(
      { error: 'Service error. Please try again.', retryable: true },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'YouTube AI Content Suite',
    sections: VALID_SECTIONS,
    usage: 'POST { section: "<one of the 10>", text: "..." }'
  });
}
