'use client';

import { useEffect, useState } from 'react';
import type { Establishment } from '@/modules/establishments/types';
import { getOpeningStatus } from '@/modules/establishments/opening-hours';

export function OpeningStatus({ place }: { place: Pick<Establishment, 'operatingHours'> }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const status = getOpeningStatus(place, now);
  const color = status.state === 'open' ? '#4ade80' : status.state === 'closed' ? 'var(--muted)' : '#f0b45b';
  return (
    <span className="tag" style={{ color, borderColor: color, fontWeight: 700 }} aria-label={status.label}>
      {status.state === 'open' ? '● ' : status.state === 'closed' ? '○ ' : '◷ '}
      {status.label}
    </span>
  );
}
