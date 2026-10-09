import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getWeekendDays } from '@/lib/weekend';

const events = readFileSync(resolve(process.cwd(), 'data/seeds/events-2026-09.ts'), 'utf8');


describe('Agenda do fim de semana 02–04/10/2026', () => {
  it('inclui novas agendas confirmadas', () => {
    expect(events).toContain('vibrae-sobradinho-2026-10-02');
    expect(events).toContain('complexo-inflama-2026-10-02');
    expect(events).toContain('oscarito-sextanejada-2026-10-02');
    expect(events).toContain('contexto-deu-mo-love-sanchez-2026-10-02');
    expect(events).toContain('rancho-sabado-automotivo-2026-10-03');
    expect(events).toContain('infinu-jovem-dionisio-2026-10-03');
    expect(events).toContain('infinu-liga-tripa-2026-10-03');
    expect(events).toContain("03/10/2026 · 20h às 2h de 04/10");
  });

  it('organiza a página por sexta, sábado e domingo', () => {
    expect(getWeekendDays(new Date('2026-10-02T12:00:00Z')).map(day => day.title)).toEqual([
      'Sexta-feira · 02/10', 'Sábado · 03/10', 'Domingo · 04/10',
    ]);
  });
});
