import { parseStringPromise } from 'xml2js';

const WC_KEYWORDS = ['world cup', 'worldcup', 'wc2026', 'fifa', 'world cup 2026',
  'match', 'goal', 'football', 'soccer', 'qualifier', 'stadium',
  'messi', 'ronaldo', 'mbappe', 'neymar', 'brazil', 'argentina', 'france',
  'england', 'germany', 'spain', 'portugal', 'netherlands'];

const TEAMS = [
  'Argentina', 'Brazil', 'France', 'England', 'Germany', 'Spain',
  'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Italy', 'Uruguay',
  'USA', 'Mexico', 'Canada', 'Japan', 'South Korea', 'Morocco',
  'Senegal', 'Ghana', 'Nigeria', 'Saudi Arabia', 'Australia', 'Denmark',
  'Switzerland', 'Poland', 'Serbia', 'Switzerland'
];

export async function getWorldCupTrends() {
  const trends = [];

  // 1. Try Google Trends for World Cup topics
  try {
    const url = 'https://trends.google.com/trending/rss?geo=US';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });

    if (res.ok) {
      const xml = await res.text();
      const parsed = await parseStringPromise(xml);
      const items = parsed?.rss?.channel?.[0]?.item || [];

      for (const item of items) {
        const title = item.title?.[0] || '';
        const trafficStr = item['ht:approx_traffic']?.[0] || '0';
        const traffic = parseInt(trafficStr.replace(/[^\d]/g, '')) || 0;

        const isWc = WC_KEYWORDS.some(k => title.toLowerCase().includes(k)) ||
                     TEAMS.some(t => title.toLowerCase().includes(t.toLowerCase()));

        if (isWc) {
          trends.push({
            title,
            traffic: Math.max(traffic, 10000),
            url: item.link?.[0] || '',
            pubDate: item.pubDate?.[0] || new Date().toISOString(),
            source: 'google-wc',
            region: 'US',
            weight: 2.0,
            score: Math.max(traffic, 10000) * 2.0,
            isWorldCup: true
          });
        }
      }
    }
  } catch (err) {
    console.warn('[WC] Google Trends fetch failed:', err.message);
  }

  // 2. Generate key match/event topics if not enough
  if (trends.length < 5) {
    const now = new Date();
    const matchTitles = generateWcTopics(now);
    for (const t of matchTitles) {
      if (!trends.some(ex => ex.title.toLowerCase() === t.toLowerCase())) {
        trends.push({
          title: t,
          traffic: 50000,
          url: '',
          pubDate: now.toISOString(),
          source: 'worldcup-2026',
          region: 'global',
          weight: 2.5,
          score: 125000,
          isWorldCup: true
        });
      }
    }
  }

  return trends;
}

function generateWcTopics(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // June 2026 = month 6

  const topics = [
    `${TEAMS[Math.floor(Math.random() * TEAMS.length)]} vs ${TEAMS[Math.floor(Math.random() * TEAMS.length)]} World Cup 2026 Match Preview`,
    `World Cup 2026: ${TEAMS[Math.floor(Math.random() * TEAMS.length)]} Advances to Knockout Stage`,
    `Top Goals and Highlights from World Cup 2026 Today`,
    `World Cup 2026 Group Standings Update`,
    `${TEAMS[Math.floor(Math.random() * TEAMS.length)]} Star Player Shines in World Cup 2026`,
    `World Cup 2026: Upset of the Tournament So Far`,
    `How ${TEAMS[Math.floor(Math.random() * TEAMS.length)]} Can Qualify for Round of 16`,
    `World Cup 2026 Stadiums: Best Moments from Today's Matches`,
    `Tactical Analysis: ${TEAMS[Math.floor(Math.random() * TEAMS.length)]} Dominates in World Cup 2026`,
    `World Cup 2026: Complete Match Schedule and Results`,
    `Fan Reactions: World Cup 2026 Biggest Surprises`,
    `World Cup 2026 Records Broken So Far`,
  ];

  // Shuffle and return unique topics
  return [...new Set(topics)].sort(() => Math.random() - 0.5).slice(0, 8);
}

export function isWorldCupTopic(trend) {
  return trend.isWorldCup === true ||
         WC_KEYWORDS.some(k => trend.title?.toLowerCase().includes(k)) ||
         TEAMS.some(t => trend.title?.toLowerCase().includes(t.toLowerCase()));
}
