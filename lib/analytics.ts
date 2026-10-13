export type AnalyticsEvent =
  | 'page_view'
  | 'place_view'
  | 'map_click'
  | 'whatsapp_click'
  | 'instagram_click'
  | 'favorite'
  | 'share'
  | 'search'
  | 'trial_start'
  | 'subscription_checkout';

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

// One identifier per browser tab; this measures sessions, not people.
export function getAnalyticsSessionId(): string | undefined {
  try {
    const key = 'noitedf.analytics.session';
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id = window.crypto.randomUUID();
      window.sessionStorage.setItem(key, id);
    }
    return id;
  } catch { return undefined; }
}

export function track(
  name: AnalyticsEvent,
  properties: Record<string, string | number | boolean> = {}
) {
  if (typeof window === 'undefined') return;

  // GA4 already records route changes through GoogleAnalytics.
  if (name !== 'page_view') (window as AnalyticsWindow).gtag?.('event', name, properties);

  const establishmentId =
    typeof properties.establishmentId === 'string'
      ? properties.establishmentId
      : typeof properties.placeId === 'string'
        ? properties.placeId
        : undefined;

  void fetch('/api/analytics/track', {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      sessionId: getAnalyticsSessionId(),
      establishmentId,
      properties,
      path: window.location.pathname,
      source: 'web',
    }),
  }).catch(() => undefined);
}
