import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing',
  description: 'Choose the perfect Chafiktech Ai plan - Free, Pro, or Business. AI-powered content creation tools for every budget.',
  openGraph: { title: 'Pricing - Chafiktech Ai', description: 'Choose the perfect AI-powered content creation plan. Free, Pro, or Business.' },
  twitter: { card: 'summary_large_image', title: 'Pricing - Chafiktech Ai', description: 'Choose the perfect AI-powered content creation plan. Free, Pro, or Business.' }
};

export default function PricingPage() {
  return <PricingClient />;
}
