import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember20 } from '@/data/seeds/events-2026-11-20';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 20/11/2026', () => {
  it('registra dez eventos confirmados em fontes oficiais', () => {
    expect(confirmedEventsNovember20).toHaveLength(18);
    expect(new Set(confirmedEventsNovember20.map((event) => event.id)).size).toBe(18);

    for (const event of confirmedEventsNovember20) {
      expect(event.startsAt).toBeTruthy();
      expect(event.endsAt).toBeTruthy();
      expect(event.expiresAt).toBe(event.endsAt);
      expect(event.source?.kind).toBe('official');
      expect(['2026-11-20', '2026-11-21']).toContain(event.source?.verifiedAt);
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.publicationStatus).toBe('published');
    }
  });

  it('inclui os eventos confirmados do lote na agenda pública e usa o line-up atualizado do Oscarito', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-20T09:00:00-03:00'));

    const agenda = await getPublicAgenda();

    const cpx = agenda.find((event) => event.id === 'domingo-cpx-complexo-2026-11-22');
    expect(cpx?.startsAt).toBe('2026-11-22T20:00:00-03:00');
    expect(cpx?.endsAt).toBe('2026-11-23T04:00:00-03:00');
    expect(cpx?.description).toContain('Gustavo Machado');
    expect(cpx?.source?.url).toBe('https://www.sympla.com.br/evento/lgc/3656762');
    expect(cpx?.source?.verifiedAt).toBe('2026-11-21');

    const conexao = agenda.find((event) => event.id === 'conexao-delas-oscarito-2026-11-22');
    expect(conexao?.startsAt).toBe('2026-11-22T09:00:00-03:00');
    expect(conexao?.endsAt).toBe('2026-11-22T12:00:00-03:00');
    expect(conexao?.source?.url).toBe('https://www.sympla.com.br/evento/conexao-delas/3654214');
    expect(conexao?.source?.verifiedAt).toBe('2026-11-21');

    const deuMoLove = agenda.find((event) => event.id === 'deu-mo-love-contexto-2026-11-20');
    expect(deuMoLove?.startsAt).toBe('2026-11-20T18:00:00-03:00');
    expect(deuMoLove?.endsAt).toBe('2026-11-21T04:00:00-03:00');
    expect(deuMoLove?.description).toContain('Artur Campos');
    expect(deuMoLove?.source?.verifiedAt).toBe('2026-11-20');

    const sabadoMagico = agenda.find((event) => event.id === 'sabado-magico-contexto-2026-11-21');
    expect(sabadoMagico?.startsAt).toBe('2026-11-21T11:00:00-03:00');
    expect(sabadoMagico?.endsAt).toBe('2026-11-22T04:00:00-03:00');
    expect(sabadoMagico?.source?.verifiedAt).toBe('2026-11-21');

    const londonAsaSul = agenda.find((event) => event.id === 'london-music-bar-asa-sul-2026-11-20');
    expect(londonAsaSul?.startsAt).toBe('2026-11-20T20:00:00-03:00');
    expect(londonAsaSul?.source?.url).toContain('3659936');

    const londonAguasClaras = agenda.find((event) => event.id === 'london-music-bar-aguas-claras-2026-11-21');
    expect(londonAguasClaras?.startsAt).toBe('2026-11-21T20:00:00-03:00');
    expect(londonAguasClaras?.source?.url).toContain('3659923');
    expect(londonAguasClaras?.source?.verifiedAt).toBe('2026-11-21');


    const girls = agenda.find((event) => event.id === 'girls-just-wanna-rock-fun-london-asa-sul-2026-11-21');
    expect(girls?.startsAt).toBe('2026-11-21T20:00:00-03:00');
    expect(girls?.endsAt).toBe('2026-11-22T03:00:00-03:00');
    expect(girls?.description).toContain('Arthemis');
    expect(girls?.source?.verifiedAt).toBe('2026-11-21');

    const butecada = agenda.find((event) => event.id === 'butecada-sertaneja-new-mercadito-2026-11-21');
    expect(butecada?.startsAt).toBe('2026-11-21T17:00:00-03:00');
    expect(butecada?.endsAt).toBe('2026-11-22T02:00:00-03:00');
    expect(butecada?.source?.url).toContain('3660539');

    const sambinha = agenda.find((event) => event.id === 'sambinha-da-vila-minas-brasilia-2026-11-21');
    expect(sambinha?.startsAt).toBe('2026-11-21T15:30:00-03:00');
    expect(sambinha?.endsAt).toBe('2026-11-22T02:00:00-03:00');
    expect(sambinha?.source?.url).toContain('3656482');

    const choppada = agenda.find((event) => event.id === 'choppada-da-mada-boteco-2026-11-22');
    expect(choppada?.startsAt).toBe('2026-11-22T13:00:00-03:00');
    expect(choppada?.endsAt).toBe('2026-11-22T23:30:00-03:00');
    expect(choppada?.description).toContain('Leozinho');


    const curral = agenda.find((event) => event.id === 'curral-surra-de-modao-cais-do-lago-2026-12-05');
    expect(curral?.startsAt).toBe('2026-12-05T20:00:00-03:00');
    expect(curral?.endsAt).toBe('2026-12-06T05:00:00-03:00');
    expect(curral?.place).toBe('Cais do Lago');
    expect(curral?.source?.url).toContain('3653158');

    const temporium = agenda.find((event) => event.id === 'temporium-uk-music-hall-2026-12-10');
    expect(temporium?.startsAt).toBe('2026-12-10T20:00:00-03:00');
    expect(temporium?.endsAt).toBe('2026-12-11T03:00:00-03:00');
    expect(temporium?.description).toContain('Strangeways');
    expect(temporium?.description).toContain('Dr. Rock');
    expect(temporium?.source?.url).toContain('3652189');


    const beli = agenda.find((event) => event.id === 'pagode-do-beli-orla-clube-2026-11-21');
    expect(beli?.startsAt).toBe('2026-11-21T16:00:00-03:00');
    expect(beli?.endsAt).toBe('2026-11-22T02:00:00-03:00');
    expect(beli?.description).toContain('DJs Vinny');
    expect(beli?.source?.url).toContain('3657546');

    const forroVitrola = agenda.find((event) => event.id === 'forro-de-vitrola-casa-de-jorge-2026-11-22');
    expect(forroVitrola?.startsAt).toBe('2026-11-22T18:00:00-03:00');
    expect(forroVitrola?.endsAt).toBe('2026-11-22T23:59:00-03:00');
    expect(forroVitrola?.place).toBe('A Casa de Jorge');
    expect(forroVitrola?.source?.url).toContain('3654904');

    const sambaPovoRua = agenda.find((event) => event.id === 'samba-do-povo-da-rua-casa-de-jorge-2026-11-27');
    expect(sambaPovoRua?.startsAt).toBe('2026-11-27T22:00:00-03:00');
    expect(sambaPovoRua?.endsAt).toBe('2026-11-28T01:30:00-03:00');
    expect(sambaPovoRua?.source?.url).toContain('3658614');

    const biuAmsterdam = agenda.find((event) => event.id === 'biu-do-piseiro-amsterdam-2026-11-27');
    expect(biuAmsterdam?.startsAt).toBe('2026-11-27T20:00:00-03:00');
    expect(biuAmsterdam?.endsAt).toBe('2026-11-28T03:00:00-03:00');
    expect(biuAmsterdam?.place).toBe('Amsterdam Bar');
    expect(biuAmsterdam?.source?.url).toContain('3644812');

    const sambinhaOrla = agenda.find((event) => event.id === 'sambinha-na-orla-clube-engenharia-2026-11-27');
    expect(sambinhaOrla?.startsAt).toBe('2026-11-27T20:00:00-03:00');
    expect(sambinhaOrla?.endsAt).toBe('2026-11-28T04:00:00-03:00');
    expect(sambinhaOrla?.description).toContain('Caju Pra Baixo');
    expect(sambinhaOrla?.source?.url).toContain('3649109');

    const feijoadaContexto = agenda.find((event) => event.id === 'feijoada-amor-de-aluguel-contexto-2026-11-28');
    expect(feijoadaContexto?.startsAt).toBe('2026-11-28T11:00:00-03:00');
    expect(feijoadaContexto?.endsAt).toBe('2026-11-29T04:00:00-03:00');
    expect(feijoadaContexto?.admissionNote).toContain('59,90');
    expect(feijoadaContexto?.source?.url).toContain('3626169');

    const tamborzao = agenda.find((event) => event.id === 'tamborzao-orla-clube-engenharia-2026-11-28');
    expect(tamborzao?.startsAt).toBe('2026-11-28T20:00:00-03:00');
    expect(tamborzao?.endsAt).toBe('2026-11-29T04:00:00-03:00');
    expect(tamborzao?.place).toBe('Orla do Clube de Engenharia — Pier 21');
    expect(tamborzao?.source?.url).toContain('3653788');


    const reveillonSamamBar = agenda.find((event) => event.id === 'reveillon-samambar-2027-2026-12-31');
    expect(reveillonSamamBar?.startsAt).toBe('2026-12-31T20:00:00-03:00');
    expect(reveillonSamamBar?.endsAt).toBe('2027-01-01T06:00:00-03:00');
    expect(reveillonSamamBar?.place).toBe('SamamBar');
    expect(reveillonSamamBar?.description).toContain('Grupo Moleque');
    expect(reveillonSamamBar?.source?.url).toContain('3652554');

    const mikaelen = agenda.find((event) => event.id === 'ticiana-mikaelen-barbosa-2026-11-20');
    expect(mikaelen?.startsAt).toBe('2026-11-20T19:30:00-03:00');
    expect(mikaelen?.source?.url).toBe('https://www.ticianawerner.com.br/musica.php');

    const fernanda = agenda.find((event) => event.id === 'ticiana-fernanda-rabelo-2026-11-21');
    expect(fernanda?.startsAt).toBe('2026-11-21T19:30:00-03:00');
    expect(fernanda?.source?.url).toBe('https://www.ticianawerner.com.br/musica.php');

    const sextanejada = agenda.find((event) => event.id === 'sextanejada-oscarito-2026-11-20');
    expect(sextanejada?.description).toContain('Violada Original às 20h30');
    expect(sextanejada?.description).toContain('Henrique & Ruan às 23h');
    expect(sextanejada?.source?.verifiedAt).toBe('2026-11-20');
  });
});
