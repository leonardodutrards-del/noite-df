import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => ({ url: 'https://example.supabase.co', serviceRoleKey: 'test-key' }),
}));

vi.mock('@/modules/events/store', () => ({
  listEditorialEvents: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/modules/establishments/service', () => ({
  establishmentService: { search: vi.fn().mockResolvedValue([]) },
}));

import { getPublicAgenda } from '@/modules/events/public-agenda';

afterEach(() => vi.useRealTimers());

describe('Agenda local verificada com Supabase ativo', () => {
  it('inclui o lote de 17/11 e as correções editoriais no caminho usado em produção', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-17T08:00:00-03:00'));

    const agenda = await getPublicAgenda();

    expect(agenda.some((event) => event.id === 'consciencia-negra-babylon-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'noite-na-skina-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'pagodao-das-estrelas-amsterdam-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'marilia-tavares-amsterdam-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'domingo-cpx-complexo-2026-11-22')).toBe(true);
    expect(agenda.some((event) => event.id === 'conexao-delas-oscarito-2026-11-22')).toBe(true);
    expect(agenda.some((event) => event.id === 'deu-mo-love-contexto-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'sabado-magico-contexto-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'london-music-bar-asa-sul-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'london-music-bar-aguas-claras-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'girls-just-wanna-rock-fun-london-asa-sul-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'butecada-sertaneja-new-mercadito-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'sambinha-da-vila-minas-brasilia-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'choppada-da-mada-boteco-2026-11-22')).toBe(true);
    expect(agenda.some((event) => event.id === 'curral-surra-de-modao-cais-do-lago-2026-12-05')).toBe(true);
    expect(agenda.some((event) => event.id === 'ticiana-mikaelen-barbosa-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'ticiana-fernanda-rabelo-2026-11-21')).toBe(true);


    expect(agenda.some((event) => event.id === 'pagode-do-beli-orla-clube-2026-11-21')).toBe(true);
    expect(agenda.some((event) => event.id === 'forro-de-vitrola-casa-de-jorge-2026-11-22')).toBe(true);
    expect(agenda.some((event) => event.id === 'samba-do-povo-da-rua-casa-de-jorge-2026-11-27')).toBe(true);
    expect(agenda.some((event) => event.id === 'biu-do-piseiro-amsterdam-2026-11-27')).toBe(true);
    expect(agenda.some((event) => event.id === 'sambinha-na-orla-clube-engenharia-2026-11-27')).toBe(true);
    expect(agenda.some((event) => event.id === 'feijoada-amor-de-aluguel-contexto-2026-11-28')).toBe(true);
    expect(agenda.some((event) => event.id === 'tamborzao-orla-clube-engenharia-2026-11-28')).toBe(true);

    const sertanejada = agenda.find((event) => event.id === 'surra-de-modao-contexto-2026-11-18');
    expect(sertanejada?.title).toBe('A Sertajenada convida + Cardápio em Dobro');

    const toma = agenda.find((event) => event.id === 'festa-toma-contexto-2026-11-21');
    expect(toma?.endsAt).toBe('2026-11-22T06:00:00-03:00');
  });
});
