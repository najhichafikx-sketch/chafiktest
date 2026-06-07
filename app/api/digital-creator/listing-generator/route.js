import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';
import {
  LISTING_SYSTEM_PROMPT,
  LISTING_PLATFORMS,
  buildListingPrompt,
  getListingCacheKey,
  getCachedListing,
  setCachedListing,
  validateListingResponse,
  parseAIResponseText,
  isValidProductName
} from '@/lib/services/listing-generator';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const productName = String(body.product_name || body.productName || '').trim();
    if (!isValidProductName(productName)) {
      return NextResponse.json(
        { error: 'product_name is required (2-200 characters)' },
        { status: 400 }
      );
    }

    const cacheKey = getListingCacheKey(productName);
    const cached = getCachedListing(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        product_name: productName,
        platforms: cached.platforms,
        meta: cached.meta
      });
    }

    let aiText = null;
    let modelUsed = null;
    try {
      aiText = await generateAIContent({
        prompt: buildListingPrompt(productName),
        systemPrompt: LISTING_SYSTEM_PROMPT,
        toolId: 'ai-digital-creator-listing-generator',
        maxTokens: 3500,
        temperature: 0.75
      });
      modelUsed = 'ai-digital-creator-listing-generator';
    } catch (aiErr) {
      console.error('[listing-generator] OpenRouter error:', aiErr?.message);
      const msg = aiErr?.message || 'AI service error';
      const status = msg.includes('not configured') ? 503 : 502;
      return NextResponse.json(
        { error: msg.includes('not configured') ? msg : 'AI service is temporarily unavailable. Please try again.' },
        { status }
      );
    }

    const parsed = parseAIResponseText(aiText);
    if (!parsed) {
      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.' },
        { status: 502 }
      );
    }

    const validation = validateListingResponse(parsed);
    if (!validation.ok) {
      console.error('[listing-generator] Validation failed:', validation.reason);
      return NextResponse.json(
        { error: `AI output failed validation: ${validation.reason}. Please try again.` },
        { status: 502 }
      );
    }

    const result = validation.value;
    result.product_name = productName;
    const meta = {
      generated_at: new Date().toISOString(),
      model: modelUsed,
      platforms: Object.keys(LISTING_PLATFORMS)
    };

    setCachedListing(cacheKey, { platforms: result.platforms, meta });

    return NextResponse.json({
      success: true,
      cached: false,
      product_name: productName,
      platforms: result.platforms,
      meta
    });
  } catch (err) {
    console.error('[listing-generator] route error:', err);
    return NextResponse.json(
      { error: 'Listing generator service failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Platform-Specific Product Listing Generator',
    platforms: LISTING_PLATFORMS,
    usage: 'POST { product_name: "string" }'
  });
}
