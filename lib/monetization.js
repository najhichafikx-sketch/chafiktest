export const TOOL_MONETIZATION = {
  'seo-article': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'content' },
  'image-to-prompt': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'media' },
  'video-to-prompt': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'media' },
  'tiktok': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'social' },
  'youtube': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'social' },
  'ai-humanizer': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'content' },
  'ad-copy': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'marketing' },
  'amazon-listing': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'ecommerce' },
  'product-description': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'ecommerce' },
  'etsy-listing': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'ecommerce' },
  'landing-page': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'marketing' },
  'sales-copy': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'marketing' },
  'shopify-seo': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'ecommerce' },
  'product-title': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'ecommerce' },
  'review-response': { weight: 'low', density: 1, slots: ['bottom'], category: 'support' },
  'pricing': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'business' },
  'product-idea': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'ecommerce' },
  'product-image': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'media' },
  'digital-product': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'digital' },
  'digital-name': { weight: 'low', density: 1, slots: ['bottom'], category: 'digital' },
  'email-writer': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'marketing' },
  'dropshipping': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'ecommerce' },
  'prompt-article': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'content' },
  'prompt-viral': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'content' },
  'viral-ideas': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'youtube-title': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'viral-hook': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'youtube-script': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'thumbnail-prompt': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'youtube' },
  'youtube-description': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'youtube' },
  'youtube-tags': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'youtube' },
  'youtube-seo': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'faceless-video': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'viral-shorts': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'storytelling-script': { weight: 'high', density: 3, slots: ['top', 'mid', 'bottom'], category: 'youtube' },
  'community-post': { weight: 'low', density: 1, slots: ['bottom'], category: 'youtube' },
  'comment-reply': { weight: 'low', density: 1, slots: ['bottom'], category: 'support' },
  'video-repurposer': { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'youtube' }
};

export const AD_SLOT_WEIGHTS = {
  top: { ctrWeight: 1.2, label: 'Top of Tool', expectedCtr: '0.8-1.5%' },
  mid: { ctrWeight: 1.5, label: 'Mid Tool (Sticky)', expectedCtr: '1.2-2.5%' },
  bottom: { ctrWeight: 1.0, label: 'Bottom Result', expectedCtr: '0.5-1.0%' }
};

export function getMonetizationProfile(toolId) {
  return TOOL_MONETIZATION[toolId] || { weight: 'medium', density: 2, slots: ['top', 'bottom'], category: 'general' };
}

export function getAdSlotsForTool(toolId) {
  const profile = getMonetizationProfile(toolId);
  return profile.slots;
}

export function getToolCategoryGroup(toolId) {
  const profile = getMonetizationProfile(toolId);
  const groups = {
    high: { label: 'Premium Tools', density: 3 },
    medium: { label: 'Standard Tools', density: 2 },
    low: { label: 'Basic Tools', density: 1 }
  };
  return groups[profile.weight] || groups.medium;
}
