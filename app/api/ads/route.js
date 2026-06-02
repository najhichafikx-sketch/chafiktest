import { getAdSettings } from '@/lib/db';

const FALLBACK_ADS = {
  header: { location: 'header', enabled: true, code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>` },
  sidebar: { location: 'sidebar', enabled: true, code: `<script>atOptions={'key':'5983cb0a797c265c05633e0c354663fd','format':'iframe','height':300,'width':160,'params':{}};</script><script src="https://www.highperformanceformat.com/5983cb0a797c265c05633e0c354663fd/invoke.js"></script>` },
  content_top: { location: 'content_top', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  content_bottom: { location: 'content_bottom', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  footer: { location: 'footer', enabled: true, code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>` },
  popup: { location: 'popup', enabled: true, code: `<script>window.open('https://www.effectivecpmnetwork.com/kvnw38jp?key=d0cba4ffa97061f6ee503168678dac31','_blank');</script>` },
  in_tool: { location: 'in_tool', enabled: true, code: `<script>atOptions={'key':'4149a344a99b71b99d6838feca234c79','format':'iframe','height':50,'width':320,'params':{}};</script><script src="https://www.highperformanceformat.com/4149a344a99b71b99d6838feca234c79/invoke.js"></script>` },
  loading_state: { location: 'loading_state', enabled: true, code: `<script>atOptions={'key':'4149a344a99b71b99d6838feca234c79','format':'iframe','height':50,'width':320,'params':{}};</script><script src="https://www.highperformanceformat.com/4149a344a99b71b99d6838feca234c79/invoke.js"></script>` },
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
