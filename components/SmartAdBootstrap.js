'use client';

import { useEffect } from 'react';
import { AdController } from '@/lib/adSystem';

const BLACKLISTED_PREFIXES = ['/admin', '/login', '/register'];
const BLACKLISTED_EXACT = ['/', '/admin-login'];

export default function SmartAdBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (BLACKLISTED_EXACT.includes(path)) return;
    if (BLACKLISTED_PREFIXES.some(p => path.startsWith(p))) return;

    const ctx = AdController.init();
    if (!ctx) return;

    AdController.bindClickPopunder();
    AdController.bindSocialBarTrigger(() => AdController.maybeShowSocialBar());

    AdController.Geo.detect().catch(() => {});

    if (ctx.pageType === 'tool' || ctx.pageType === 'blog' || ctx.pageType === 'landing') {
      setTimeout(() => AdController.maybeShowSocialBar(), ctx.config.timing.socialBarDelayMs);
    }
  }, []);

  return null;
}
