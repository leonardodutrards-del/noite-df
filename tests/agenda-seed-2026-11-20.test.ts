import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember20 } from '@/data/seeds/events-2026-11-20';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 20/11/2026', () => {
  it('registra os quatro eventos novos confirmados em fontes oficiais', () => {
    expect(confirmedEventsNovember20).toHaveLength(4);
    expect(new Set(confirmedEventsNovember20.map((event) => event.id)).size).toBe(4);

    for (const event of confirmedEventsNovember20) {
      expect(event.startsAt).toBeTruthy();
      expect(event.endsAt).toBeTruthy();
      expect(event.expiresAt).toBe(event.endsAt);
      expect(event.source?.kind).toBe('official');
      expect(event.source?.verifiedAt).toBe('2026-11-20');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.publicationStatus).toBe('published');
    }
  });

  it('inclui os oito eventos na agenda pública e usa o line-up atualizado do Oscarito', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-20T09:00:00-03:00'));

    const agenda = await getPublicAgenda();

    const cpx = agenda.find((event) => event.id === 'domingo-cpx-complexo-2026-11-22');
    expect(cpx?.startsAt).toBe('2026-11-22T20:00:00-03:00');
    expect(cpx?.endsAt).toBe('2026-11-23T04:00:00-03:00');
    expect(cpx?.description).toContain('Gustavo Machado');
    expect(cpx?.source?.url).toBe('https://www.sympla.com.br/evento/lgc/3656762');

    const conexao = agenda.find((event) => event.id === 'conexao-delas-oscarito-2026-11-22');
    expect(conexao?.startsAt).toBe('2026-11-22T09:00:00-03:00');
    expect(conexao?.endsAt).toBe('2026-11-22T12:00:00-03:00');
    expect(conexao?.source?.url).toBe('https://www.sympla.com.br/evento/conexao-delas/3654214');

    const deuMoLove = agenda.find((event) => event.id === 'deu-mo-love-contexto-2026-11-20');
    expect(deuMoLove?.startsAt).toBe('2026-11-20T18:00:00-03:00');
    expect(deuMoLove?.endsAt).toBe('2026-11-21T04:00:00-03:00');
    expect(deuMoLove?.description).toContain('Artur Campos');
    expect(deuMoLove?.source?.verifiedAt).toBe('2026-11-20');

    const sabadoMagico = agenda.find((event) => event.id === 'sabado-magico-contexto-2026-11-21');
    expect(sabadoMagico?.startsAt).toBe('2026-11-21T11:00:00-03:00');
    expect(sabadoMagico?.endsAt).toBe('2026-11-22T04:00:00-03:00');

    const londonAsaSul = agenda.find((event) => event.id === 'london-music-bar-asa-sul-2026-11-20');
    expect(londonAsaSul?.startsAt).toBe('2026-11-20T20:00:00-03:00');
    expect(londonAsaSul?.source?.url).toContain('3659936');

    const londonAguasClaras = agenda.find((event) => event.id === 'london-music-bar-aguas-claras-2026-11-21');
    expect(londonAguasClaras?.startsAt).toBe('2026-11-21T20:00:00-03:00');
    expect(londonAguasClaras?.source?.url).toContain('3659923');

    const mikaelen = agenda.find((event) => event.id === 'ticiana-mikaelen-barbosa-2026-11-20');
    expect(mikaelen?.startsAt).toBe('2026-11-20T19:30:00-03:00');
    expect(mikaelen?.source?.url).toBe('https://www.ticianawerner.com.br/');

    const fernanda = agenda.find((event) => event.id === 'ticiana-fernanda-rabelo-2026-11-21');
    expect(fernanda?.startsAt).toBe('2026-11-21T19:30:00-03:00');
    expect(fernanda?.source?.url).toBe('https://www.ticianawerner.com.br/');

    const sextanejada = agenda.find((event) => event.id === 'sextanejada-oscarito-2026-11-20');
    expect(sextanejada?.description).toContain('Violada Original às 20h30');
    expect(sextanejada?.description).toContain('Henrique & Ruan às 23h');
    expect(sextanejada?.source?.verifiedAt).toBe('2026-11-20');
  });
});
