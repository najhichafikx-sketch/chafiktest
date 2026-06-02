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

export function trackAdImpression({ slot, toolId, pagePath, variant }) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'ad_impression', {
    ad_slot: slot,
    tool_id: toolId || '',
    page_path: pagePath || window.location.pathname,
    ad_variant: variant || 'default'
  });
}

export function trackAdClick({ slot, toolId, pagePath, variant }) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'ad_click', {
    ad_slot: slot,
    tool_id: toolId || '',
    page_path: pagePath || window.location.pathname,
    ad_variant: variant || 'default'
  });
}
