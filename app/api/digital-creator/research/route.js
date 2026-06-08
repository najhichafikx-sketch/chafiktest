import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM = `You are a digital product trend analyst and market researcher. Analyze current market trends to find profitable digital product opportunities.

Return ONLY valid JSON:
{
  "trendingProducts": [
    {
      "productIdea": "Product name",
      "demandScore": 85,
      "competitionScore": 35,
      "profitPotential": "High / Medium / Low",
      "difficultyLevel": "Easy / Medium / Hard",
      "recommendedPlatform": "Etsy / Amazon KDP / Gumroad / Creative Market",
      "reasoning": "Why this product is trending"
    }
  ],
  "niches": {
    "growing": ["Niche 1", "Niche 2"],
    "highDemand": ["Niche 3", "Niche 4"],
    "lowCompetition": ["Niche 5", "Niche 6"],
    "evergreen": ["Niche 7", "Niche 8"],
    "seasonal": [{"niche": "Seasonal Niche", "peakMonths": "Nov-Dec"}]
  },
  "trendData": {
    "risingSearches": ["search 1", "search 2"],
    "searchInterest": "High / Medium / Low",
    "relatedQueries": ["query 1", "query 2"],
    "emergingOpportunities": ["opportunity 1", "opportunity 2"]
  },
  "marketplaceInsights": {
    "etsy": {"popularTypes": ["type 1"], "buyerIntent": "intent", "marketGaps": ["gap 1"], "underservedNiches": ["niche"]},
    "kdp": {"popularTypes": ["type 1"], "buyerIntent": "intent", "marketGaps": ["gap 1"], "underservedNiches": ["niche"]},
    "gumroad": {"popularTypes": ["type 1"], "buyerIntent": "intent", "marketGaps": ["gap 1"], "underservedNiches": ["niche"]},
    "creativeMarket": {"popularTypes": ["type 1"], "buyerIntent": "intent", "marketGaps": ["gap 1"], "underservedNiches": ["niche"]}
  }
}`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { niche, audience, platform } = body;

    const prompt = `Research digital product opportunities for:
Niche: ${niche || 'General digital products'}
Target Audience: ${audience || 'General'}
Platform Focus: ${platform || 'All marketplaces'}

${body.highProfitMode ? 'FOCUS ON HIGH-PROFIT OPPORTUNITIES: Higher revenue potential, lower competition, easier creation, faster validation, better scalability.' : ''}

Generate 5-7 trending product ideas with validation scores and complete market analysis.`;

    const result = await generateAIContent({
      prompt,
      systemPrompt: SYSTEM,
      toolId: 'ai-digital-creator',
      model: 'google/gemini-2.5-pro',
      maxTokens: 3000,
      temperature: 0.5
    });

    let parsed;
    try {
      const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse research results.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
