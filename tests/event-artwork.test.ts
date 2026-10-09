import { describe, expect, it } from 'vitest';
import { validateEventArtwork } from '@/modules/events/artwork';
import { validateEditorialEvent, editorialEventToPublic } from '@/modules/events/editorial';
import { prepareAgendaCommunication } from '@/modules/events/communication';
import { places } from '@/data/places';

const now = new Date('2026-10-09T14:00:00Z');
const artwork = { url: 'https://images.example.com/flyer.jpg', alt: 'Flyer da Sextanejada', credit: 'Oscarito', sourceUrl: 'https://www.instagram.com/oscarito/', authorized: true };
const input = { establishment_id: 'oscarito-brasilia', title: 'Sextanejada', category: 'Sertanejo', description: 'Evento no SIG, Quadra 1.', official_url: 'https://www.sympla.com.br/evento/3606314', starts_at: '2026-10-09T19:00:00-03:00', ends_at: '2026-10-10T02:00:00-03:00', publication_status: 'published', sourceConfirmed: true };
const place = places.find(place => place.id === input.establishment_id)!;
const publicEvent = (patch = {}) => editorialEventToPublic({ ...validateEditorialEvent({ ...input, ...patch }, now), id: 'event-1', updated_at: now.toISOString() }, place, now)!;

describe('Imagens editoriais e propostas de divulgação', () => {
  it('mantém eventos sem imagem e preserva os créditos quando existe flyer', () => {
    expect(publicEvent().artwork).toBeUndefined();
    expect(publicEvent({ artwork }).artwork).toEqual(artwork);
  });
  it('exige autorização para publicar uma imagem, inclusive pela API', () => {
    expect(() => validateEditorialEvent({ ...input, artwork: { ...artwork, authorized: false } }, now)).toThrow('INVALID_EVENT');
    expect(validateEventArtwork({ ...artwork, authorized: false }, false)?.authorized).toBe(false);
  });
  it('rejeita URLs inseguras e imagens sem descrição, fonte ou crédito', () => {
    for (const patch of [{ url: 'javascript:alert(1)' }, { url: 'https://127.0.0.1/a.jpg' }, { url: 'https://localhost/a.jpg' }, { url: 'https://user:pass@images.example.com/a.jpg' }, { sourceUrl: '' }, { alt: '' }, { credit: '' }]) {
      expect(() => validateEventArtwork({ ...artwork, ...patch }, true)).toThrow('INVALID_EVENT');
    }
  });
  it('gera propostas com fontes e link semanal, sem repetir o mesmo evento', () => {
    const event = publicEvent({ artwork });
    const proposals = prepareAgendaCommunication([event, event], now);
    expect(proposals.feed).toHaveLength(1);
    expect(proposals.feed[0].page).toContain('agenda-semanal');
    expect(proposals.feed[0].caption).toContain(input.official_url);
    expect(proposals.feed[0].concept).toContain('Oscarito');
    expect(proposals.story?.id).toBe('story:2026-10-09');
    expect(prepareAgendaCommunication([event], now).feed[0].id).toBe(proposals.feed[0].id);
  });
  it('retira propostas após encerramento e usa a agenda mensal para eventos futuros', () => {
    const event = publicEvent();
    expect(prepareAgendaCommunication([event], new Date(input.ends_at))).toEqual({ feed: [], story: null });
    const future = publicEvent({ starts_at: '2026-10-17T19:00:00-03:00', ends_at: '2026-10-18T02:00:00-03:00' });
    expect(prepareAgendaCommunication([future], now).feed[0].page).toContain('agenda-mensal');
    expect(prepareAgendaCommunication([future], now).story).toBeNull();
  });
});
