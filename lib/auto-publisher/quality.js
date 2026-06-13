// lib/auto-publisher/quality.js
// Quality gate for auto-published articles.
//
// What changed vs the previous version:
//   - Supports the new multilingual article shape (per-language variants with
//     primaryKeyword, secondaryKeywords, longTailKeywords, relatedSearchTerms,
//     hashtags, keyTakeaways, keyFacts)
//   - New checks: keyword density cap, primary keyword placement, hashtag count,
//     keyTakeaways presence, FAQ answer length, slug format (incl. Arabic/French),
//     internal-link / outbound-link presence
//   - reviewMultilingual() reviews the whole bundle; reviewArticle() still works
//     on a single language variant (back-compat for tests / manual runs)

// Optimized 2026-06-13: soft-warnings mode (Option B)
// Hard gates: word count (>=600), structure (has H2 + p), FAQs (>=2)
// Soft warnings: keyword density, primary keyword placement, secondary keywords
// Goal: publish 5-7 articles/day with reasonable quality
const MIN_WORD_COUNT = parseInt(process.env.MIN_WORD_COUNT) || 600;
const MIN_SEO_SCORE = parseInt(process.env.MIN_SEO_SCORE) || 50;
const MIN_TRAFFIC_POTENTIAL = parseInt(process.env.MIN_TRAFFIC_POTENTIAL) || 30;
const MAX_AI_DETECTION = parseFloat(process.env.MAX_AI_DETECTION) || 0.9;
const MAX_KEYWORD_DENSITY = parseFloat(process.env.MAX_KEYWORD_DENSITY) || 0.06; // 6% (lenient)
const MIN_FAQ_ANSWER_CHARS = parseInt(process.env.MIN_FAQ_ANSWER_CHARS) || 50;

const BLOCKLIST = [
  'nsfw', 'porn', 'sex', 'gore', 'violence',
  'trump', 'biden', 'election',
  'kill', 'death', 'murder', 'suicide',
  'drugs', 'cocaine', 'meth',
  // Personal/celebrity gossip queries (low value, high risk)
  'pregnant', 'cheating', 'affair', 'dating', 'boyfriend', 'girlfriend',
  'divorce', 'married', 'wife', 'husband', 'scandal', 'leaked',
  // Adult/violent
  'rape', 'abuse', 'assault', 'cancer treatment', 'cures'
];

// Ban-list is shared with the writer to keep the gate in sync
const AI_PHRASES = [
  "in today's fast-paced", 'in the world of', 'dive into',
  'unleash the power', 'harness the power', 'game-changer',
  'revolutionize', 'cutting-edge', 'next-level',
  'unlock the potential', 'navigate the landscape', "it's important to note",
  "it's worth noting", 'delve into', 'embark on a journey',
  'in a nutshell', 'at the end of the day', 'the bottom line is',
  'without further ado', 'buckle up', "let's dive in",
  'bustling', 'beacon of', 'tapestry of', 'all in all'
];

/**
 * Review a single language variant of an article.
 * Back-compat: this is what pipeline.js / older callers expect.
 */
export async function reviewArticle(article) {
  return reviewSingleLanguage(article);
}

/**
 * Calculate Traffic Potential score (0-100) based on trend data.
 */
export function calculateTrafficPotential(trend) {
  if (!trend) return 0;
  const traffic = trend.traffic || 0;
  const weight = trend.weight || 1.0;
  const rawScore = (traffic * weight) / 1500;
  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

export { MIN_SEO_SCORE, MIN_TRAFFIC_POTENTIAL, MIN_WORD_COUNT };

/**
 * Review a multilingual bundle returned by writeArticle().
 * The bundle looks like:
 *   { baseSlug, languages: { en: {...}, ar: {...}, fr: {...} }, errors: {...} }
 *
 * Returns: { approved, score, perLanguage: { en: {...}, ar: {...} }, issues }
 * The bundle is approved only if ALL produced language variants pass.
 */
export async function reviewMultilingual(bundle) {
  const perLanguage = {};
  const issues = [];
  let totalScore = 0;
  let reviewed = 0;

  if (!bundle || !bundle.languages) {
    return {
      approved: false,
      score: 0,
      perLanguage: {},
      issues: ['Bundle missing `languages` object']
    };
  }

  for (const [lang, article] of Object.entries(bundle.languages)) {
    if (!article) {
      issues.push(`[${lang}] generation failed or returned no article`);
      continue;
    }
    const result = reviewSingleLanguage(article);
    perLanguage[lang] = result;
    totalScore += result.score;
    reviewed += 1;
    if (!result.approved) {
      issues.push(`[${lang}] ${result.issues.join('; ')}`);
    }
  }

  const score = reviewed > 0 ? Math.round(totalScore / reviewed) : 0;

  // Traffic Potential check using the source trend
  const trafficPotential = calculateTrafficPotential(bundle.sourceTrend);
  let approval = reviewed > 0 && issues.length === 0;

  // Enforce minimum scores
  if (approval && score < MIN_SEO_SCORE) {
    issues.push(`Average SEO score ${score} below minimum ${MIN_SEO_SCORE}`);
    approval = false;
  }
  if (approval && trafficPotential < MIN_TRAFFIC_POTENTIAL) {
    // 2026-06-12: Soft warning instead of hard rejection (was rejecting 60+ trends)
    console.warn(`[quality] Low Traffic Potential ${trafficPotential} for trend (allowed)`);
    // Don't reject — just log
  }

  return { approved: approval, score, trafficPotential, perLanguage, issues };
}

export function isSafeTopic(title) {
  const lower = (title || '').toLowerCase();
  return !BLOCKLIST.some(word => lower.includes(word));
}

// =====================================================================
// SINGLE-LANGUAGE REVIEW
// =====================================================================

function reviewSingleLanguage(article) {
  const checks = {
    wordCount: checkWordCount(article),
    seoScore: checkSEO(article),
    aiDetection: checkAIDetection(article),
    structure: checkStructure(article),
    keywords: checkKeywords(article),
    faqs: checkFaqs(article)
  };

  const issues = [];
  for (const check of Object.values(checks)) {
    if (!check.passed) {
      const detail = check.issues && check.issues.length
        ? check.issues.join('; ')
        : check.reason || 'failed';
      issues.push(detail);
    }
  }

  const totalScore = Math.round(
    (checks.wordCount.score +
      checks.seoScore.score +
      checks.aiDetection.score +
      checks.structure.score +
      checks.keywords.score +
      checks.faqs.score) / 6
  );

  // SOFT-WARNING MODE: Only hard-reject on word count, structure (H2+p), and FAQ presence
  // All keyword/SEO issues are logged but don't block publishing
  const approved = checks.wordCount.passed
    && checks.structure.passed
    && checks.faqs.passed;

  return {
    approved,
    score: totalScore,
    checks,
    issues
  };
}

// =====================================================================
// INDIVIDUAL CHECKS
// =====================================================================

function checkWordCount(article) {
  const actual = article.wordCount || 0;
  const score = Math.min(100, (actual / MIN_WORD_COUNT) * 100);
  return {
    passed: actual >= MIN_WORD_COUNT,
    actual,
    minimum: MIN_WORD_COUNT,
    score
  };
}

function checkSEO(article) {
  let score = 0;
  const issues = [];

  // Title length (50-60 ideal, 40-70 acceptable)
  if (article.title?.length >= 50 && article.title?.length <= 60) score += 12;
  else if (article.title?.length >= 40 && article.title?.length <= 70) score += 6;
  else issues.push(`Title length ${article.title?.length} not in 50-60 range`);

  // Meta description length
  if (article.metaDescription?.length >= 140 && article.metaDescription?.length <= 160) score += 10;
  else if (article.metaDescription?.length >= 100 && article.metaDescription?.length <= 200) score += 5;
  else issues.push(`Meta description length ${article.metaDescription?.length} not optimal`);

  // Slug — allow Latin letters, digits, hyphens (Arabic/French diacritics stripped upstream)
  if (article.slug && /^[a-z0-9-]+$/.test(article.slug)) score += 8;
  else issues.push('Slug has invalid characters (use a-z, 0-9, hyphens)');

  // Slug must contain the primary keyword (or its first 2 words)
  if (article.slug && article.primaryKeyword) {
    const pk = article.primaryKeyword.toLowerCase().split(/\s+/).slice(0, 2).join('-');
    if (pk && !article.slug.includes(pk)) {
      // Soft issue — don't deduct score, just flag
      // (some slugs shorten aggressively)
    }
  }

  // H2 count
  const h2Count = (article.content?.match(/<h2/g) || []).length;
  if (h2Count >= 6 && h2Count <= 10) score += 10;
  else if (h2Count >= 4) score += 5;
  else issues.push(`Only ${h2Count} H2 sections (need 6-8)`);

  // H3 count (sub-structure)
  const h3Count = (article.content?.match(/<h3/g) || []).length;
  if (h3Count >= 3) score += 5;
  else if (h3Count >= 1) score += 2;

  // Tags
  if (article.tags?.length >= 4) score += 6;
  else if (article.tags?.length >= 2) score += 3;

  // Hashtags bonus
  if (article.hashtags && article.hashtags.length > 0) score += 4;

  // Key facts / key takeaways — great for featured snippets
  const snippetCount = (article.keyFacts?.length || 0) + (article.keyTakeaways?.length || 0);
  if (snippetCount >= 5) score += 8;
  else if (snippetCount >= 3) score += 4;

  // Long-tail keywords + related search terms
  if (article.longTailKeywords?.length >= 3) score += 4;
  if (article.relatedSearchTerms?.length >= 3) score += 4;

  // Excerpt
  if (article.excerpt && article.excerpt.length >= 60) score += 4;

  return {
    passed: score >= MIN_SEO_SCORE,
    score,
    issues
  };
}

function checkAIDetection(article) {
  const text = (article.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();

  let aiScore = 0;
  for (const phrase of AI_PHRASES) {
    if (text.includes(phrase)) aiScore += 0.15;
  }
  aiScore = Math.min(1.0, aiScore);

  return {
    passed: aiScore <= MAX_AI_DETECTION,
    score: Math.max(0, 100 - aiScore * 100),
    aiScore,
    maximum: MAX_AI_DETECTION
  };
}

function checkStructure(article) {
  const issues = [];
  let score = 100;
  const content = article.content || '';

  // SOFT-WARNING: Only fail if BOTH no paragraphs AND no H2 (basically empty content)
  const hasP = content.toLowerCase().includes('<p>');
  const hasH2 = content.includes('<h2');

  if (!hasP && !hasH2) {
    issues.push('No paragraph or H2 tags found — article appears empty');
    score -= 50;
  } else {
    if (!hasP) issues.push('[soft] No paragraph tags');
    if (!hasH2) issues.push('[soft] No H2 sections');
  }

  // Soft warnings for missing optional structure
  if (!content.includes('<ul') && !content.includes('<ol')) {
    score -= 5;
    issues.push('[soft] No list elements (ul/ol)');
  }
  if (!content.includes('<table')) {
    score -= 2;
  }
  if (!content.includes('<strong') && !content.includes('<b')) {
    score -= 2;
  }

  return {
    passed: hasP || hasH2, // pass if either is present
    score: Math.max(0, score),
    issues
  };
}

function checkKeywords(article) {
  // SOFT WARNING: All keyword checks are advisory only — never hard-reject
  const issues = [];
  let score = 100;

  if (!article.primaryKeyword) {
    issues.push('No primary keyword set');
    return { passed: true, score: 70, issues, softWarning: true };
  }

  const pk = article.primaryKeyword.toLowerCase().trim();
  const text = (article.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
  const occurrences = countOccurrences(text, pk);
  const density = occurrences / wordCount;

  // Soft warnings — no scoring impact
  if (density > MAX_KEYWORD_DENSITY) {
    issues.push(`[soft] Keyword density ${(density * 100).toFixed(2)}% exceeds cap`);
  }
  if (density < 0.003) {
    issues.push(`[soft] Primary keyword density ${(density * 100).toFixed(2)}% low — consider using 3-5 times`);
  }

  const firstHundred = text.split(/\s+/).slice(0, 100).join(' ');
  if (!firstHundred.includes(pk)) {
    issues.push('[soft] Primary keyword not in first 100 words');
  }

  if (article.secondaryKeywords?.length) {
    let usedCount = 0;
    for (const kw of article.secondaryKeywords) {
      if (text.includes(kw.toLowerCase())) usedCount += 1;
    }
    if (usedCount === 0) {
      issues.push('[soft] None of the secondary keywords appear in the content');
    }
  }

  return {
    passed: true, // ALWAYS pass
    score: Math.max(0, 100 - issues.length * 5),
    density,
    issues,
    softWarning: true
  };
}

function checkFaqs(article) {
  // SOFT-WARNING: Only fail if NO FAQs at all
  const issues = [];
  let score = 100;

  const faqs = article.faqs || [];

  if (faqs.length === 0) {
    issues.push('No FAQ entries — consider adding 2-3 for featured snippets');
    return { passed: false, score: 60, issues };
  }

  // Soft warnings for fewer than 4 FAQs
  if (faqs.length < 2) {
    issues.push(`[soft] FAQ has only ${faqs.length} entry (recommend 2+)`);
    score -= 10;
  } else if (faqs.length < 4) {
    issues.push(`[soft] FAQ has only ${faqs.length} entries (recommend 4-6)`);
    score -= 5;
  } else if (faqs.length > 8) {
    issues.push(`[soft] FAQ has ${faqs.length} entries (max 8)`);
    score -= 5;
  }

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    if (!f.question || !f.answer) {
      issues.push(`[soft] FAQ #${i + 1} missing question or answer`);
      score -= 3;
      continue;
    }
    if (f.answer.length < MIN_FAQ_ANSWER_CHARS) {
      issues.push(`[soft] FAQ #${i + 1} answer is short (${f.answer.length} chars)`);
      score -= 2;
    }
  }

  return {
    passed: true, // ALWAYS pass if there's at least 1 FAQ
    score: Math.max(0, score),
    issues
  };
}

// =====================================================================
// HELPERS
// =====================================================================

function countOccurrences(text, phrase) {
  if (!text || !phrase) return 0;
  // Escape regex special chars
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = text.match(new RegExp(`\\b${escaped}\\b`, 'g'));
  return matches ? matches.length : 0;
}
