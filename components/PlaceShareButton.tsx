'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

export function PlaceShareButton({ placeId, name, slug }: { placeId: string; name: string; slug: string }) {
  const [message, setMessage] = useState('');
  async function share() {
    const url = new URL(`/lugar/${slug}`, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} | Noite DF`, url });
        track('share', { placeId, method: 'native' });
        setMessage('Compartilhamento concluído.');
      } else {
        await navigator.clipboard.writeText(url);
        track('share', { placeId, method: 'copy_link' });
        setMessage('Link copiado.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessage('Não foi possível compartilhar. Copie o endereço da página.');
    }
  }
  return <div><button type="button" className="button ghost" onClick={share}>Compartilhar local</button><span role="status">{message}</span></div>;
}
