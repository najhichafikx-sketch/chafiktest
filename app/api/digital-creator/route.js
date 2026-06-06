import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM_PROMPT = `You are an expert in optimizing and selling digital products on platforms like Etsy, Amazon KDP, Gumroad, Creative Fabrica, and Teachers Pay Teachers. You deeply understand marketplace SEO, pricing psychology, conversion optimization, cover design, and social media marketing. Always respond with ONLY valid JSON (no markdown fences, no explanation outside the JSON). Use the exact field names and types requested.`;

function buildPrompt(data) {
  return `Analyze this digital product and provide a comprehensive optimization report.

Platform: ${data.platform}
Product Title: "${data.title}"
${data.description ? `Current Description: ${data.description}` : ''}
${data.keywords ? `Current Tags/Keywords: ${data.keywords}` : ''}
${data.price ? `Current Price: ${data.price}` : ''}
${data.url ? `Product URL: ${data.url}` : ''}

Return ONLY a valid JSON object (no markdown, no text outside JSON) with this EXACT structure:
{
  "seo_score": 75,
  "competition_score": 60,
  "demand_score": 80,
  "conversion_score": 70,
  "monthly_prediction_min": 5,
  "monthly_prediction_max": 30,
  "optimized_title": "SEO-optimized title in English, max 140 chars, with highest-value keywords first",
  "keywords": ["long-tail keyword 1", "long-tail keyword 2", "long-tail keyword 3", "long-tail keyword 4", "long-tail keyword 5", "long-tail keyword 6", "long-tail keyword 7", "long-tail keyword 8", "long-tail keyword 9"],
  "bullets": ["Compelling bullet 1 (max 200 chars)", "Compelling bullet 2", "Compelling bullet 3", "Compelling bullet 4", "Compelling bullet 5"],
  "cover_tips": ["Specific cover design tip 1", "Cover design tip 2", "Cover design tip 3", "Cover design tip 4"],
  "strengths": ["Current strength 1", "Current strength 2", "Current strength 3", "Current strength 4"],
  "weaknesses": ["Current weakness 1", "Current weakness 2", "Current weakness 3", "Current weakness 4"],
  "price_min": 9.99,
  "price_recommended": 14.99,
  "price_premium": 24.99,
  "bundle_idea": "Specific bundle idea to increase AOV",
  "upsell_idea": "Specific upsell offer to increase LTV",
  "instagram": "Full Instagram caption with 5-7 relevant hashtags at the end, emoji-rich, under 2200 chars",
  "pinterest": "Pinterest description in English, keyword-rich, 2-3 sentences with a clear hook",
  "twitter": "Engaging tweet under 280 chars with 1-2 hashtags",
  "facebook": "Facebook post with hook, story, value, and CTA (3-5 short paragraphs)",
  "email_subject": "Compelling email subject line under 60 chars",
  "email_body": "Short email body (5-8 lines) with hook, value, social proof, and CTA"
}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { platform, title, description, keywords, price, url, imageBase64, imageMimeType } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const userPrompt = buildPrompt({ platform: platform || 'Etsy', title: title.trim(), description, keywords, price, url });

    const result = await generateAIContent({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      toolId: 'ai-digital-creator',
      maxTokens: 3500,
      imageBase64: imageBase64 || null,
      imageMimeType: imageMimeType || null
    });

    let parsed;
    try {
      const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (err) {
    const msg = err.message || 'Internal server error';
    const isConfigError = msg.includes('AI feature not configured') || msg.includes('All models failed');
    return NextResponse.json({ error: msg }, { status: isConfigError ? 503 : 502 });
  }
}
