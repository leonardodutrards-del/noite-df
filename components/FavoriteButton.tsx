'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';

const STORAGE_KEY = 'noite-df-favorites';

function localIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({ establishmentId }: { establishmentId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !saved;
    const response = await fetch('/api/user/favorites', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ establishmentId }),
    });

    if (response.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (response.ok) {
      const ids = new Set(localIds());
      if (next) ids.add(establishmentId); else ids.delete(establishmentId);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
      setSaved(next);
      if (next) track('favorite', { establishmentId });
    }
    setBusy(false);
  }

  return <button className="button ghost" type="button" onClick={() => void toggle()} disabled={busy}>{saved ? '★ Favorito' : '☆ Salvar'}</button>;
}
