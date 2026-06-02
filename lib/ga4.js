export function trackPageView(pagePath) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', window.GA_MEASUREMENT_ID, { page_path: pagePath });
}

export function trackToolUsed(toolId, toolName) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'tool_used', { tool_id: toolId, tool_name: toolName });
}

export function trackBlogView(slug, title) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'blog_view', { blog_slug: slug, blog_title: title });
}

export function trackSignup(method = 'email') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'signup', { method });
}

export function trackLogin(method = 'email') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'login', { method });
}

export function trackAdImpression(slot, toolId) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'ad_impression', { ad_slot: slot, tool_id: toolId });
}

export function trackAdClick(slot, toolId) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'ad_click', { ad_slot: slot, tool_id: toolId });
}
