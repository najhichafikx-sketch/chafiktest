'use client';

import { useState, useCallback } from 'react';
import HeroBanner from '@/components/dashboard/HeroBanner';
import Topbar from '@/components/dashboard/Topbar';
import Sidebar from '@/components/dashboard/Sidebar';
import CanvasPreview from '@/components/dashboard/CanvasPreview';
import { useGenerate } from '@/hooks/useGenerate';
import { MODEL_COSTS } from '@/lib/stripe';

export default function ThumbnailGeneratorPage() {
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('basic');
  const [dimension, setDimension] = useState('16:9');
  const [personImage, setPersonImage] = useState(null);
  const [references, setReferences] = useState([]);
  const [colors, setColors] = useState([]);

  const { loading, result, progress, generate, reset } = useGenerate();
  const estimatedCost = MODEL_COSTS[model] || MODEL_COSTS.basic;

  const handleGenerate = useCallback(async () => {
    if (!title.trim() || loading) return;
    await generate({ title, dimension, model, personImage, references });
  }, [title, dimension, model, personImage, references, loading, generate]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `thumbnail-${Date.now()}.png`;
    link.click();
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0f', color: '#f0f0f0' }}>
      <HeroBanner />
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          title={title} onTitleChange={setTitle}
          references={references} onReferencesChange={setReferences}
          personImage={personImage} onPersonImageChange={setPersonImage}
          colors={colors} onColorsChange={setColors}
          model={model} onModelChange={setModel}
          dimension={dimension} onDimensionChange={setDimension}
          onGenerate={handleGenerate} loading={loading} estimatedCost={estimatedCost}
        />
        <CanvasPreview
          loading={loading} result={result}
          onDownload={handleDownload} onRedo={reset} progress={progress}
        />
      </div>
    </div>
  );
}
