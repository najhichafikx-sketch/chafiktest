import { generateAIContent } from '@/lib/openrouter';

export async function POST(request) {
  try {
    const { topic, style, faceImage } = await request.json();
    if (!topic || !topic.trim()) {
      return Response.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const styleMap = {
      cinematic: 'cinematic, dramatic lighting, shallow depth of field, rich colors, 16:9, ultra-detailed',
      vlog: 'bright natural lighting, warm tones, friendly aesthetic, 16:9, clean composition',
      gaming: 'energetic, vibrant neon colors, dynamic composition, high contrast, bold text overlay area, 16:9',
    };

    const styleDesc = styleMap[style] || styleMap.cinematic;

    const systemPrompt = `You are an expert social media thumbnail designer and prompt engineer. Your job is to expand a given video topic into a highly detailed, professional Stable Diffusion / Flux prompt for generating an eye-catching social media thumbnail.

Rules:
- Output ONLY the English prompt text, no explanations, no greetings.
- The prompt must be detailed: subject, camera angle, lighting, colors, composition, mood, style, text placement hints.
- Use the provided style as a guide.
- Keep it under 200 words.
- Format as a single paragraph.`;

    const userPrompt = `Video Topic: "${topic}"
Style: ${styleDesc}

Generate a professional Stable Diffusion/Flux prompt for a click-worthy social media thumbnail.`;

    const rawPrompt = await generateAIContent({
      prompt: userPrompt,
      systemPrompt,
      model: 'openai/gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 500,
      toolId: 'thumbnail-generator',
    });

    const cleanPrompt = rawPrompt.trim().replace(/^["']|["']$/g, '');

    return Response.json({
      success: true,
      prompt: cleanPrompt,
      topic: topic.trim(),
      style,
      message: 'Prompt generated successfully. Ready for image generation.',
    });
  } catch (err) {
    console.error('thumbnail-generator error:', err);
    return Response.json({ success: false, error: err.message || 'Generation failed' }, { status: 500 });
  }
}
