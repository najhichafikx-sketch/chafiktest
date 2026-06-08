import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM = `You are a digital product launch strategist. Create comprehensive launch plans.

Return ONLY valid JSON:
{
  "launchChecklist": [
    {"phase": "Pre-Launch", "tasks": ["Task 1", "Task 2"]},
    {"phase": "Launch Week", "tasks": ["Task 1", "Task 2"]},
    {"phase": "Post-Launch", "tasks": ["Task 1", "Task 2"]}
  ],
  "marketingPlan": "2-3 paragraph marketing strategy",
  "contentStrategy": "Content strategy description",
  "pinterestStrategy": "Pinterest promotion strategy",
  "emailSequence": [
    {"day": -7, "subject": "Teaser email", "body": "Email body"},
    {"day": 0, "subject": "Launch email", "body": "Email body"},
    {"day": 3, "subject": "Follow-up", "body": "Email body"}
  ],
  "socialMediaPlan": {
    "instagram": ["Post 1", "Post 2"],
    "pinterest": ["Pin 1", "Pin 2"],
    "twitter": ["Tweet 1", "Tweet 2"],
    "tiktok": ["Video idea 1", "Video idea 2"]
  }
}`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { productName, platform, audience } = body;

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const prompt = `Create a complete launch plan for:
Product: ${productName}
Platform: ${platform || 'Etsy'}
Target Audience: ${audience || 'General digital buyers'}

Provide launch checklist, marketing plan, content strategy, email sequence, and social media plan.`;

    const result = await generateAIContent({
      prompt,
      systemPrompt: SYSTEM,
      toolId: 'ai-digital-creator',
      model: 'openai/gpt-4o',
      maxTokens: 3000,
      temperature: 0.6
    });

    let parsed;
    try {
      const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse launch plan.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
