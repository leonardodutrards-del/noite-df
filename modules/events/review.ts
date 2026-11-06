import type { EditorialEvent } from './editorial';

const REVIEW_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export type AgendaReviewState = 'expired' | 'review' | 'current';

export function getAgendaReviewState(event: Pick<EditorialEvent, 'publication_status' | 'starts_at' | 'ends_at' | 'verified_at'>, now = new Date()): AgendaReviewState {
  if (Date.parse(event.ends_at) <= now.getTime()) return 'expired';
  if (event.publication_status !== 'published') return 'review';
  const verifiedAt = event.verified_at ? Date.parse(event.verified_at) : NaN;
  if (!Number.isFinite(verifiedAt) || now.getTime() - verifiedAt >= REVIEW_INTERVAL_MS) return 'review';
  return 'current';
}

export function isAgendaReviewDue(event: Pick<EditorialEvent, 'publication_status' | 'starts_at' | 'ends_at' | 'verified_at'>, now = new Date()) {
  return getAgendaReviewState(event, now) === 'review';
}
