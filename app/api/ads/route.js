import { getAdSettings } from '@/lib/db';

const FALLBACK_ADS = {
  header: { location: 'header', enabled: true, code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>` },
  sidebar: { location: 'sidebar', enabled: true, code: `<script>atOptions={'key':'a4638a9f907475a8243f653a6e4bd7ad','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a4638a9f907475a8243f653a6e4bd7ad/invoke.js"></script>` },
  content_top: { location: 'content_top', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  content_bottom: { location: 'content_bottom', enabled: true, code: `<script async="async" data-cfasync="false" src="https://pl29606011.effectivecpmnetwork.com/c31d4601494437332d755db50ae828b0/invoke.js"></script><div id="container-c31d4601494437332d755db50ae828b0"></div>` },
  footer: { location: 'footer', enabled: true, code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>` },
  popup: { location: 'popup', enabled: true, code: `<script>atOptions={'key':'a4638a9f907475a8243f653a6e4bd7ad','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a4638a9f907475a8243f653a6e4bd7ad/invoke.js"></script>` }
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
