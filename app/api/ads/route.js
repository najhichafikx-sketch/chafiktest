import { getAdSettings } from '@/lib/db';

const FALLBACK_ADS = {
  header: { location: 'header', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  sidebar: { location: 'sidebar', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  content_top: { location: 'content_top', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  content_bottom: { location: 'content_bottom', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  footer: { location: 'footer', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  in_tool: { location: 'in_tool', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  loading_state: { location: 'loading_state', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  mid_result: { location: 'mid_result', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` }
};

export async function GET() {
  try {
    const dbAds = await getAdSettings();
    if (dbAds && dbAds.length > 0) {
      const ads = {};
      for (const a of dbAds) {
        if (a.enabled && a.code) ads[a.location] = { location: a.location, enabled: true, code: a.code };
      }
      return Response.json({ success: true, ads });
    }
  } catch {}

  return Response.json({ success: true, ads: FALLBACK_ADS });
}
