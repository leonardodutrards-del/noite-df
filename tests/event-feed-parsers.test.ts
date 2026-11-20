import { describe, expect, it } from 'vitest';
import { parseHtmlJsonLdEvents, parseIcsCalendar, parseRssAtomFeed } from '../modules/events/feed-parsers';

describe('event feed parsers', () => {
  it('maps explicit event dates from RSS without treating pubDate as the event date', () => {
    const xml = `<rss><channel><item><title>Show ao vivo</title><guid>show-1</guid><pubDate>Sat, 07 Nov 2026 10:00:00 GMT</pubDate><eventStart>2026-11-08T20:00:00-03:00</eventStart><eventEnd>2026-11-09T02:00:00-03:00</eventEnd><link>https://example.org/show</link></item></channel></rss>`;
    const [event] = parseRssAtomFeed(xml);
    expect(event.title).toBe('Show ao vivo');
    expect(event.startsAt).toBe('2026-11-08T23:00:00.000Z');
    expect(event.sourceEventKey).toBe('show-1');
  });

  it('parses Atom link href and event start date fields', () => {
    const xml = `<feed><entry><title>Festival</title><id>urn:festival:1</id><link rel="alternate" href="https://example.org/festival"/><eventStart>2026-12-12T18:00:00Z</eventStart></entry></feed>`;
    const [event] = parseRssAtomFeed(xml);
    expect(event.url).toBe('https://example.org/festival');
    expect(event.startsAt).toBe('2026-12-12T18:00:00.000Z');
  });

  it('parses UTC iCalendar events', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:night-1',
      'SUMMARY:Noite de rock',
      'DTSTART:20261108T230000Z',
      'DTEND:20261109T030000Z',
      'URL:https://example.org/rock',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const [event] = parseIcsCalendar(ics);
    expect(event.startsAt).toBe('2026-11-08T23:00:00.000Z');
    expect(event.title).toBe('Noite de rock');
  });

  it('does not guess a timezone for TZID-local or all-day iCalendar values', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'SUMMARY:Evento local',
      'DTSTART;TZID=America/Sao_Paulo:20261108T200000',
      'DTEND;TZID=America/Sao_Paulo:20261109T020000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const [event] = parseIcsCalendar(ics);
    expect(event.startsAt).toContain('LOCAL=');
    expect(event.endsAt).toContain('LOCAL=');
  });

  it('extracts only Schema.org Event JSON-LD from official HTML and preserves local time for review', () => {
    const html = `<html><script type="application/ld+json">{"@context":"https://schema.org","@type":"MusicEvent","name":"Show no DF","startDate":"2026-11-14T20:00:00","endDate":"2026-11-15T02:00:00","location":{"@type":"Place","name":"Casa de Shows"},"url":"https://example.org/show","identifier":"show-14"}</script></html>`;
    const [event] = parseHtmlJsonLdEvents(html, 'https://example.org/agenda');
    expect(event.title).toBe('Show no DF');
    expect(event.startsAt).toContain('LOCAL=20261114T200000');
    expect(event.endsAt).toContain('LOCAL=20261115T020000');
    expect(event.location).toBe('Casa de Shows');
    expect(event.sourceEventKey).toBe('show-14');
  });

  it('preserves timezone-less RSS event times for human review', () => {
    const xml = `<rss><channel><item><title>Show local</title><eventStart>2026-11-08T20:00:00</eventStart><eventEnd>2026-11-09T02:00:00</eventEnd><link>https://example.org/show</link></item></channel></rss>`;
    const [event] = parseRssAtomFeed(xml);
    expect(event.startsAt).toBe('LOCAL=20261108T200000');
    expect(event.endsAt).toBe('LOCAL=20261109T020000');
  });

  it('extracts Event nested under Schema.org ItemList ListItem.item', () => {
    const html = `<script type="application/ld+json">{"@type":"ItemList","itemListElement":[{"@type":"ListItem","item":{"@type":"MusicEvent","name":"Show listado","startDate":"2026-11-14T20:00:00-03:00","endDate":"2026-11-15T02:00:00-03:00","url":"https://example.org/show"}}]}</script>`;
    const [event] = parseHtmlJsonLdEvents(html, 'https://example.org/agenda');
    expect(event.title).toBe('Show listado');
    expect(event.startsAt).toBe('2026-11-14T23:00:00.000Z');
  });

  it('ignores generic HTML without structured Event data', () => {
    expect(parseHtmlJsonLdEvents('<html><h1>Programação</h1></html>', 'https://example.org')).toEqual([]);
  });

  it('rejects oversized feeds', () => {
    expect(() => parseRssAtomFeed('x'.repeat(400_001))).toThrow('FEED_TOO_LARGE');
    expect(() => parseIcsCalendar('x'.repeat(400_001))).toThrow('FEED_TOO_LARGE');
  });
});
