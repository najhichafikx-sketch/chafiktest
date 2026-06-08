'use client';

export default function BlogImage({ src, alt, fallbackSrc, style, className }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={style}
      className={className}
      onError={e => { if (fallbackSrc) e.currentTarget.src = fallbackSrc; }}
    />
  );
}
