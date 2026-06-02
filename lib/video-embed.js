export function getYouTubeEmbedId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getTikTokEmbedId(url) {
  if (!url || !url.includes('tiktok.com')) return null;
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

export function getVideoEmbedUrl(url) {
  if (!url) return null;
  const ytId = getYouTubeEmbedId(url);
  if (ytId) return { type: 'youtube', id: ytId, src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1` };
  const ttId = getTikTokEmbedId(url);
  if (ttId) return { type: 'tiktok', id: ttId, src: `https://www.tiktok.com/embed/v2/${ttId}` };
  if (url.includes('tiktok.com')) return { type: 'tiktok', id: null, src: url };
  return null;
}

export function VideoEmbed({ url, autoplay = true, style }) {
  if (!url) return null;
  const embed = getVideoEmbedUrl(url);
  if (!embed) return <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unsupported URL</span></div>;

  if (embed.type === 'youtube') {
    return (
      <iframe
        src={embed.src}
        style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, border: 'none', ...style }}
        allow={`${autoplay ? 'autoplay;' : ''} encrypted-media`}
        allowFullScreen
      />
    );
  }

  if (embed.type === 'tiktok') {
    if (embed.id) {
      return (
        <iframe
          src={embed.src}
          style={{ width: '100%', aspectRatio: '9/16', maxHeight: 400, borderRadius: 12, border: 'none', ...style }}
          allow={`${autoplay ? 'autoplay;' : ''} encrypted-media`}
          allowFullScreen
        />
      );
    }
    return (
      <div style={{ textAlign: 'center', padding: 32, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎵</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>TikTok Video</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Open on TikTok →</a>
      </div>
    );
  }

  return null;
}
