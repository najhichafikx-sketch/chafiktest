import YouTubeCreatorSuiteProClient from './YouTubeCreatorSuiteProClient';

export const metadata = {
  title: 'YouTube Creator Suite Pro — Trending, AI Tools & 24+ YouTube Utilities',
  description: 'Professional YouTube creator toolkit. Discover trending videos by niche and country, generate scripts, titles, descriptions, tags, thumbnails, and use 24+ YouTube utility tools (tag extractor, channel stats, embed generator, revenue calculator, and more). Powered by AI and the YouTube Data API.',
  keywords: 'YouTube creator suite, YouTube tools, trending videos, YouTube SEO, tag extractor, channel statistics, video statistics, revenue calculator, AI script generator, YouTube thumbnails',
  openGraph: {
    title: 'YouTube Creator Suite Pro — Trending, AI Tools & 24+ YouTube Utilities',
    description: 'Trending videos by niche, 8 AI tools for content, and 24+ YouTube utility tools in one place.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Creator Suite Pro',
    description: 'Trending videos, AI tools, and 24+ YouTube utilities.',
  },
};

export default function Page() {
  return <YouTubeCreatorSuiteProClient />;
}
