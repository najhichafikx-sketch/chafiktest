'use client';

import { useEffect, useState } from 'react';
import AdManager from '@/components/AdManager';

export default function AdToolSlot({ position, toolId }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ margin: '24px 0', minHeight: 90 }}>
      <AdManager
        location={
          position === 'top'
            ? 'content_top'
            : position === 'mid'
            ? 'in_tool'
            : 'mid_result'
        }
        toolId={toolId}
      />
    </div>
  );
}