import DigitalCreatorClient from './DigitalCreatorClient';

export const metadata = {
  title: 'AI Digital Creator Suite - Optimize Etsy, KDP, Gumroad Products | Chafiktech',
  description: 'AI-powered suite to optimize your digital products for Etsy, Amazon KDP, Gumroad, Creative Fabrica, and TPT. Get SEO scores, optimized titles, keywords, pricing strategy, cover tips, and marketing copy in seconds.',
  openGraph: {
    title: 'AI Digital Creator Suite - Optimize Digital Products',
    description: 'Boost your Etsy, KDP, Gumroad sales with AI-powered SEO, pricing, and marketing analysis.',
  },
  twitter: {
    title: 'AI Digital Creator Suite',
    description: 'Optimize your digital products with AI-powered SEO, pricing, and marketing analysis.',
  },
};

export default function Page() {
  return <DigitalCreatorClient />;
}
