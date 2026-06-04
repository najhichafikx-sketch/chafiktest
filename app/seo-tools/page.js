import SeoToolsClient from './SeoToolsClient';

export const metadata = {
  title: 'SEO Tools - Free AI SEO Toolkit | Chafiktech Ai',
  description: 'Free AI-powered SEO tools: keyword research, ranking checker, meta tag generator, Open Graph checker, UTM builder, and more. Powered by OpenRouter AI.',
  openGraph: {
    title: 'SEO Tools - Free AI SEO Toolkit | Chafiktech Ai',
    description: 'Free AI-powered SEO tools: keyword research, ranking checker, meta tags, Open Graph, UTM builder, and more.',
    url: '/seo-tools',
    siteName: 'Chafiktech Ai',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Tools - Free AI SEO Toolkit | Chafiktech Ai',
    description: 'Free AI-powered SEO tools: keyword research, ranking checker, meta tags, Open Graph, UTM builder, and more.'
  }
};

export default function Page() {
  return <SeoToolsClient />;
}
