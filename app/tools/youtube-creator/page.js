import YouTubeContentSuiteClient from './YouTubeContentSuiteClient';

export const metadata = {
  title: 'YouTube AI Content Suite — Rewrite, Hooks, Scripts, Titles, SEO & More',
  description: 'AI-powered YouTube content generator. Paste a transcript or fetch one from any YouTube URL, then generate 10 sections: rewrite, SEO keywords, viral hooks, 3-style titles, full script, description, tags, AI thumbnail prompts, SEO audit, and 5 video ideas. Powered by OpenRouter.',
  keywords: 'YouTube AI, YouTube content generator, video SEO, AI script writer, YouTube title generator, viral hooks, thumbnail prompts, OpenRouter, transcript to video',
  openGraph: {
    title: 'YouTube AI Content Suite — 10 AI-Powered Sections in One Tool',
    description: 'Generate optimized YouTube content from any transcript. 10 features: rewrite, keywords, titles, hooks, script, description, tags, thumbnails, SEO, ideas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube AI Content Suite',
    description: '10 AI-powered YouTube content sections from a single transcript.',
  },
};

export default function Page() {
  return <YouTubeContentSuiteClient />;
}
