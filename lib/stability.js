const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const BASE = 'https://api.stability.ai/v1';

const STYLE_PROMPTS = {
  gaming: 'epic gaming stadium, dramatic lighting, dark blue purple atmosphere, bokeh, cinematic, neon accents, high contrast, 8k',
  sports: 'football stadium floodlights, night match, dramatic fog, professional photography, intense atmosphere, crowd energy',
  dramatic: 'explosive cinematic background, fire particles, dark moody atmosphere, volumetric lighting, 8k ultra detailed, epic scale',
  clean: 'minimal gradient background, professional studio lighting, soft gradients, clean composition, premium look, pastel tones',
  cinematic: 'cinematic widescreen, dramatic lighting, shallow depth of field, rich colors, anamorphic look, moody atmosphere',
  funny: 'bright vibrant colors, comic style, exaggerated expressions, pop art influences, energetic, playful lighting',
  educational: 'clean academic style, warm soft lighting, organized composition, professional, trustworthy aesthetic, blueprint style',
};

function buildPrompt(title, style) {
  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cinematic;
  return `YouTube thumbnail for video titled "${title}". ${stylePrompt}. High quality, eye-catching, professional thumbnail design, bold colors, clear focal point, text space on left side, no text in image, no watermark`;
}

export async function generateImage({ title, style, dimension }) {
  if (STABILITY_API_KEY) {
    try {
      return await generateWithStability({ title, style, dimension });
    } catch (err) {
      console.warn('Stability AI failed, falling back to Pollinations:', err.message);
    }
  }
  return await generateWithPollinations({ title, style, dimension });
}

async function generateWithStability({ title, style, dimension }) {
  const prompt = buildPrompt(title, style);
  const aspectRatio = dimension === '9:16' ? '768:1344' : '1344:768';

  const response = await fetch(`${BASE}/v2beta/stable-image/generate/sd3`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STABILITY_API_KEY}`,
      Accept: 'image/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      model: 'sd3-large',
      negative_prompt: 'text, watermark, signature, low quality, blurry, distorted faces, bad anatomy',
      cfg_scale: 7,
      steps: 40,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Stability AI error: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { imageBase64: base64, mimeType: 'image/png' };
}

async function generateWithPollinations({ title, style, dimension }) {
  const prompt = buildPrompt(title, style);
  const isVertical = dimension === '9:16';
  const width = isVertical ? 768 : 1280;
  const height = isVertical ? 1344 : 768;
  const seed = Math.floor(Math.random() * 999999);

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`Pollinations AI error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength < 1000) {
    throw new Error('Image generation returned empty result');
  }
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return { imageBase64: base64, mimeType: 'image/png' };
}
