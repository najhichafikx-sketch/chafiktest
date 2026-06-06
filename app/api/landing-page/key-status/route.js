import { getSetting } from '@/lib/db';

function maskKey(key) {
  if (!key || typeof key !== 'string' || key.length < 8) return null;
  return '•••••••••••••••' + key.slice(-6);
}

async function loadApiKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(process.cwd(), 'data', 'keys.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.openrouter_api_key) return data.openrouter_api_key;
    }
  } catch (e) {}
  try {
    const dbKey = await getSetting('openrouter_api_key');
    if (dbKey && typeof dbKey === 'string' && dbKey.trim()) return dbKey.trim();
  } catch (e) {}
  return null;
}

export async function GET() {
  try {
    const apiKey = await loadApiKey();
    const hasKey = !!apiKey;
    return Response.json({
      success: true,
      isConfigured: hasKey,
      maskedKey: hasKey ? maskKey(apiKey) : null,
      source: hasKey ? 'admin' : 'none'
    });
  } catch (err) {
    return Response.json({
      success: true,
      isConfigured: false,
      maskedKey: null,
      source: 'none'
    });
  }
}
