import { describe, expect, it } from 'vitest';
import { normalizeEventCandidate } from '../modules/events/ingestion';

const base = {
  title: 'Festival de Teste',
  category: 'Música',
  description: 'Evento oficial',
  establishmentId: 'venue-1',
  startsAt: '2026-12-12T20:00:00-03:00',
  endsAt: '2026-12-13T02:00:00-03:00',
  officialUrl: 'https://example.org/evento/1',
  sourceEventKey: 'event-1',
};

describe('event ingestion normalization', () => {
  it('allows only complete, verified structured sources into the auto-publication eligibility path', () => {
    const result = normalizeEventCandidate(base, {
      connectorType: 'api',
      officialSourceVerified: true,
      hostAllowed: true,
    });

    expect(result.status).toBe('eligible_for_auto_publish');
    expect(result.confidence).toBe(1);
    expect(result.startsAt).toBe('2026-12-12T23:00:00.000Z');
  });

  it('sends HTML sources to human review even when all fields are complete', () => {
    const result = normalizeEventCandidate(base, {
      connectorType: 'html',
      officialSourceVerified: true,
      hostAllowed: true,
    });

    expect(result.status).toBe('pending_review');
  });

  it('blocks insecure URLs and hosts outside the connector allowlist', () => {
    const result = normalizeEventCandidate({ ...base, officialUrl: 'http://example.org/evento/1' }, {
      connectorType: 'api',
      officialSourceVerified: true,
      hostAllowed: false,
    });

    expect(result.status).toBe('blocked');
    expect(result.reasons).toContain('invalid_source_url');
    expect(result.reasons).toContain('source_host_not_allowed');
  });

  it('requires explicit timezone offsets for timestamps', () => {
    const result = normalizeEventCandidate({ ...base, startsAt: '2026-12-12T20:00:00' }, {
      connectorType: 'ics',
      officialSourceVerified: true,
      hostAllowed: true,
    });

    expect(result.status).toBe('pending_review');
    expect(result.reasons).toContain('invalid_or_missing_start');
  });

  it('preserves explicitly marked local Schema.org times for editorial correction', () => {
    const result = normalizeEventCandidate({
      ...base,
      startsAt: 'LOCAL=20261114T200000',
      endsAt: 'LOCAL=20261115T020000',
    }, {
      connectorType: 'html',
      officialSourceVerified: true,
      hostAllowed: true,
    });

    expect(result.status).toBe('pending_review');
    expect(result.startsAt).toBe('LOCAL=20261114T200000');
    expect(result.endsAt).toBe('LOCAL=20261115T020000');
    expect(result.reasons).not.toContain('invalid_or_missing_start');
  });

  it('does not auto-publish candidates with possible duplicates', () => {
    const result = normalizeEventCandidate(base, {
      connectorType: 'webhook',
      officialSourceVerified: true,
      hostAllowed: true,
      duplicateFound: true,
    });

    expect(result.status).toBe('blocked');
    expect(result.reasons).toContain('possible_duplicate');
  });

  it('keeps incomplete manual submissions in review', () => {
    const result = normalizeEventCandidate({ title: 'Festa' }, {
      connectorType: 'manual',
      officialSourceVerified: false,
      hostAllowed: true,
    });

    expect(result.status).toBe('pending_review');
    expect(result.reasons).toContain('missing_establishment');
  });
});
