import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM_PROMPT = `You are an expert digital product strategist and marketplace analyst. Provide comprehensive product intelligence.

Return ONLY valid JSON with this exact structure:
{
  "seo_score": 75,
  "competition_score": 60,
  "demand_score": 80,
  "conversion_score": 70,
  "monthly_prediction_min": 5,
  "monthly_prediction_max": 30,
  "optimized_title": "SEO title max 140 chars",
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9"],
  "bullets": ["bullet 1","bullet 2","bullet 3","bullet 4","bullet 5"],
  "cover_tips": ["tip 1","tip 2","tip 3","tip 4"],
  "strengths": ["strength 1","strength 2","strength 3"],
  "weaknesses": ["weakness 1","weakness 2","weakness 3"],
  "price_min": 9.99,
  "price_recommended": 14.99,
  "price_premium": 24.99,
  "bundle_idea": "Bundle idea text",
  "upsell_idea": "Upsell idea text",
  "instagram": "Instagram caption with hashtags",
  "pinterest": "Pinterest description",
  "twitter": "Tweet under 280 chars",
  "facebook": "Facebook post with hook, story, CTA",
  "email_subject": "Subject under 60 chars",
  "email_body": "Email body 5-8 lines",

  "validation": {
    "demandScore": 85,
    "competitionScore": 40,
    "profitScore": 78,
    "launchDifficulty": "Easy / Medium / Hard",
    "scalabilityScore": 82,
    "longTermPotential": "High / Medium / Low",
    "finalVerdict": "High Potential Opportunity / Strong Opportunity / Moderate Opportunity / Poor Opportunity"
  },
  "blueprint": {
    "positioning": "Market positioning statement",
    "customerAvatar": "Detailed customer description",
    "painPoints": ["Pain point 1","Pain point 2","Pain point 3"],
    "desires": ["Desire 1","Desire 2","Desire 3"],
    "valueProposition": "Core value proposition",
    "usp": "Unique selling proposition",
    "pricingStrategy": "Pricing strategy description",
    "launchStrategy": "Launch strategy summary"
  },
  "keywordIntelligence": {
    "primary": ["kw1","kw2"],
    "secondary": ["kw3","kw4"],
    "longTail": ["long tail 1","long tail 2"],
    "commercial": ["buy kw1","buy kw2"],
    "buyerIntent": ["intent kw1","intent kw2"],
    "lowCompetition": ["low comp 1","low comp 2"],
    "trending": ["trending 1","trending 2"]
  },
  "imagePrompts": {
    "productCover": {"standard":"...","advanced":"...","negative":"..."},
    "etsyListing": {"standard":"...","advanced":"...","negative":"..."},
    "gumroadCover": {"standard":"...","advanced":"...","negative":"..."},
    "mockup": {"standard":"...","advanced":"...","negative":"..."},
    "pinterestPin": {"standard":"...","advanced":"...","negative":"..."},
    "productAd": {"standard":"...","advanced":"...","negative":"..."}
  }
}`;

function buildPrompt(data) {
  return `Analyze this digital product and provide a comprehensive optimization report.

Platform: ${data.platform}
Product Title: "${data.title}"
${data.description ? `Description: ${data.description}` : ''}
${data.keywords ? `Tags/Keywords: ${data.keywords}` : ''}
${data.price ? `Price: ${data.price}` : ''}
${data.url ? `URL: ${data.url}` : ''}

Provide complete analysis including validation scores, success blueprint, keyword intelligence, and image prompts.`;
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
      maxTokens: 5000,
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
