'use client';

import { useEffect } from 'react';

export default function BlogViewTracker({ slug }) {
  useEffect(() => {
    fetch('/api/blog/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug })
    }).catch(() => {});
  }, [slug]);

  return null;
}
