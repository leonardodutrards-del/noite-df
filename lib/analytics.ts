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

export function track(
  name: AnalyticsEvent,
  properties: Record<string, string | number | boolean> = {}
) {
  if (typeof window === 'undefined') return;

  (window as AnalyticsWindow).gtag?.('event', name, properties);

  const establishmentId =
    typeof properties.establishmentId === 'string'
      ? properties.establishmentId
      : typeof properties.placeId === 'string'
        ? properties.placeId
        : undefined;

  void fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      establishmentId,
      properties,
      path: window.location.pathname,
      source: 'web',
    }),
  }).catch(() => undefined);
}
