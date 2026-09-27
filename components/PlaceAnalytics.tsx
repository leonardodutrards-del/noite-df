'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

export function PlaceViewTracker({ placeId }: { placeId: string }) {
  useEffect(() => { track('place_view', { placeId }); }, [placeId]);
  return null;
}

export function TrackedPlaceLink({
  href, placeId, event, children, className,
}: {
  href: string;
  placeId: string;
  event: Extract<AnalyticsEvent, 'map_click' | 'instagram_click'>;
  children: React.ReactNode;
  className?: string;
}) {
  return <a className={className} href={href} target="_blank" rel="noreferrer"
    onClick={() => track(event, { placeId })}>{children}</a>;
}
