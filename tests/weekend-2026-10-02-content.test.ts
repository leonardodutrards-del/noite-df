import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const events = readFileSync(resolve(process.cwd(), 'data/seeds/events-2026-09.ts'), 'utf8');
const weekend = readFileSync(resolve(process.cwd(), 'app/fim-de-semana/page.tsx'), 'utf8');

describe('Agenda do fim de semana 02–04/10/2026', () => {
  it('inclui novas agendas confirmadas', () => {
    expect(events).toContain('vibrae-sobradinho-2026-10-02');
    expect(events).toContain('complexo-inflama-2026-10-02');
    expect(events).toContain('oscarito-sextanejada-2026-10-02');
    expect(events).toContain('contexto-deu-mo-love-sanchez-2026-10-02');
    expect(events).toContain('rancho-sabado-automotivo-2026-10-03');
  });

  it('organiza a página por sexta, sábado e domingo', () => {
    expect(weekend).toContain('Sexta-feira · 02/10');
    expect(weekend).toContain('Sábado · 03/10');
    expect(weekend).toContain('Domingo · 04/10');
  });
});
