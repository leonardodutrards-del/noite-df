import { describe, expect, it } from 'vitest';
import { eventDateDisplay } from '../lib/event-date-display';

describe('event date display in Brasília time', () => {
  it('explains an overnight event without repeating complete timestamps', () => {
    expect(eventDateDisplay({ startsAt: '2026-10-23T22:30:00Z', endsAt: '2026-10-24T07:00:00Z', dateLabel: '' })).toEqual({ date: 'Sexta, 23/10', time: '19h30 às 4h', note: 'Termina na madrugada de sábado, 24/10.' });
  });
  it('keeps same-day events compact', () => {
    expect(eventDateDisplay({ startsAt: '2026-10-23T19:00:00-03:00', endsAt: '2026-10-23T23:00:00-03:00', dateLabel: '' })).toEqual({ date: 'Sexta, 23/10', time: '19h às 23h', note: '' });
  });
  it('does not describe a morning finish as madrugada', () => {
    expect(eventDateDisplay({ startsAt: '2026-10-24T21:00:00-03:00', endsAt: '2026-10-25T09:00:00-03:00', dateLabel: '' }).note).toBe('Termina domingo, 25/10.');
  });
  it('preserves years across New Year and legacy labels without timestamps', () => {
    const result = eventDateDisplay({ startsAt: '2026-12-31T21:00:00-03:00', endsAt: '2027-01-01T04:00:00-03:00', dateLabel: '' });
    expect(result.date).toContain('31/12/2026');
    expect(result.note).toContain('01/01/2027');
    expect(eventDateDisplay({ dateLabel: '23/10 · 19h' })).toEqual({ date: '23/10', time: '19h', note: '' });
  });
});
