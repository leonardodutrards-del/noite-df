export type EventConnectorType = 'api' | 'rss' | 'atom' | 'ics' | 'html' | 'webhook' | 'manual';

export type EventCandidateStatus = 'blocked' | 'pending_review' | 'eligible_for_auto_publish';

export type EventIngestionTrust = {
  connectorType: EventConnectorType;
  officialSourceVerified: boolean;
  hostAllowed: boolean;
  duplicateFound?: boolean;
};

export type NormalizedEventCandidate = {
  title: string;
  category: string;
  description: string;
  establishmentId: string;
  startsAt: string;
  endsAt: string;
  priceDescription: string | null;
  officialUrl: string;
  sourceEventKey: string | null;
  confidence: number;
  status: EventCandidateStatus;
  reasons: string[];
};

const BLOCKED_EVENT_SOURCE_HOSTS = ['instagram.com', 'linktr.ee'];

export function isBlockedEventSourceHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return BLOCKED_EVENT_SOURCE_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

function timestamp(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // Preserve explicitly marked local Schema.org times for editorial review;
  // never treat them as UTC or as eligible for automatic publication.
  if (/^LOCAL=\d{8}T\d{4,6}$/.test(value)) return value;
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function secureUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Converts a connector-mapped record into a normalized candidate.
 * This function never publishes an event; it only determines whether the
 * candidate can enter the trusted auto-publication path or needs review.
 */
export function normalizeEventCandidate(
  input: Record<string, unknown>,
  trust: EventIngestionTrust
): NormalizedEventCandidate {
  const title = text(input.title ?? input.name, 200);
  const category = text(input.category ?? input.type, 80);
  const description = text(input.description ?? input.summary, 4000);
  const establishmentId = text(input.establishmentId ?? input.establishment_id, 120);
  const startsAt = timestamp(input.startsAt ?? input.starts_at ?? input.startDate);
  const endsAt = timestamp(input.endsAt ?? input.ends_at ?? input.endDate);
  const priceDescription = text(input.priceDescription ?? input.price_description ?? input.price, 500) || null;
  const officialUrl = secureUrl(input.officialUrl ?? input.official_url ?? input.url);
  const sourceEventKey = text(input.sourceEventKey ?? input.source_event_key ?? input.uid, 200) || null;

  const reasons: string[] = [];
  if (!title) reasons.push('missing_title');
  if (!category) reasons.push('missing_category');
  if (!establishmentId) reasons.push('missing_establishment');
  if (!startsAt) reasons.push('invalid_or_missing_start');
  const startsAtMs = startsAt ? Date.parse(startsAt) : Number.NaN;
  const endsAtMs = endsAt ? Date.parse(endsAt) : Number.NaN;
  if (!endsAt || (Number.isFinite(startsAtMs) && Number.isFinite(endsAtMs) && endsAtMs <= startsAtMs)) {
    reasons.push('invalid_or_missing_end');
  }
  const suppliedUrl = input.officialUrl ?? input.official_url ?? input.url;
  if (!officialUrl) reasons.push(suppliedUrl ? 'invalid_source_url' : 'missing_source_url');
  if (!trust.hostAllowed) reasons.push('source_host_not_allowed');
  if (!trust.officialSourceVerified) reasons.push('source_not_verified');
  if (trust.duplicateFound) reasons.push('possible_duplicate');

  const structuredConnector = ['api', 'rss', 'atom', 'ics', 'webhook'].includes(trust.connectorType);
  const timezoneConfirmationRequired = Boolean(startsAt?.startsWith('LOCAL=') || endsAt?.startsWith('LOCAL='));
  if (timezoneConfirmationRequired) reasons.push('timezone_confirmation_required');
  const complete = Boolean(title && category && establishmentId && startsAt && endsAt && officialUrl && !timezoneConfirmationRequired);
  const confidence = Math.max(0, Math.min(1,
    (title ? 0.2 : 0) +
    (category ? 0.1 : 0) +
    (establishmentId ? 0.2 : 0) +
    (startsAt ? 0.2 : 0) +
    (endsAt ? 0.1 : 0) +
    (officialUrl ? 0.1 : 0) +
    (trust.officialSourceVerified ? 0.05 : 0) +
    (trust.hostAllowed ? 0.05 : 0)
  ));

  const blocked = (Boolean(suppliedUrl) && !officialUrl) || !trust.hostAllowed || trust.duplicateFound === true;
  const eligible = !blocked && structuredConnector && trust.officialSourceVerified && complete && confidence >= 0.95;

  return {
    title,
    category,
    description,
    establishmentId,
    startsAt: startsAt ?? '',
    endsAt: endsAt ?? '',
    priceDescription,
    officialUrl: officialUrl ?? '',
    sourceEventKey,
    confidence: Number(confidence.toFixed(3)),
    status: blocked ? 'blocked' : eligible ? 'eligible_for_auto_publish' : 'pending_review',
    reasons,
  };
}
