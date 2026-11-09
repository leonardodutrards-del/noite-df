import type { Establishment } from '@/modules/establishments/types';
import { getOpeningStatus } from '@/modules/establishments/opening-hours';

export function OpeningStatus({ place }: { place: Pick<Establishment, 'operatingHours'> }) {
  const status = getOpeningStatus(place);
  const color = status.state === 'open' ? '#4ade80' : status.state === 'closed' ? 'var(--muted)' : '#f0b45b';
  return (
    <span className="tag" style={{ color, borderColor: color, fontWeight: 700 }} aria-label={status.label}>
      {status.state === 'open' ? '● ' : status.state === 'closed' ? '○ ' : '◷ '}
      {status.label}
    </span>
  );
}
