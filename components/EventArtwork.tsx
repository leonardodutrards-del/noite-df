'use client';

import { useState } from 'react';
import type { EventArtwork as Artwork } from '@/modules/events/artwork';

export function EventArtwork({ artwork }: { artwork: Artwork }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!artwork.authorized || failedUrl === artwork.url) return null;
  return <figure className="event-artwork">
    <a href={artwork.url} target="_blank" rel="noreferrer" aria-label={`Ampliar: ${artwork.alt}`}>
      {/* URLs editoriais de organizadores não usam o proxy de imagens do servidor. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork.url} alt={artwork.alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedUrl(artwork.url)} />
    </a>
    <figcaption><a href={artwork.sourceUrl} target="_blank" rel="noreferrer">Imagem: {artwork.credit} ↗</a></figcaption>
  </figure>;
}
