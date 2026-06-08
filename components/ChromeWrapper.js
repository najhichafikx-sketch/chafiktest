'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BannerSlot from './ads/BannerSlot';
import SideBanner from './ads/SideBanner';

export default function ChromeWrapper({ children }) {
  const pathname = usePathname();
  const isFullPage = pathname?.startsWith('/thumbnail-generator') || pathname?.startsWith('/dashboard');

  if (isFullPage) return <>{children}</>;

  return (
    <>
      <Navbar />
      <BannerSlot slotId="site-top" />
      <SideBanner side="left" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
