import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'app/sobradinho/page.tsx'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'components/ExperienceHub.tsx'), 'utf8');
const sitemap = readFileSync(resolve(process.cwd(), 'app/sitemap.ts'), 'utf8');

describe('Hub público de Sobradinho', () => {
  it('usa dados publicados e agenda confirmada da região', () => {
    expect(page).toContain("establishmentService.search({})");
    expect(page).toContain("place.region === 'Sobradinho'");
    expect(page).toContain('getTodayEvents(events, now)');
    expect(page).toContain('getWeeklyAgenda(events, now)');
    expect(page).toContain("event.region === 'Sobradinho'");
  });

  it('oferece descoberta local e caminho para o parceiro', () => {
    expect(page).toContain('O que fazer em Sobradinho hoje?');
    expect(page).toContain('/lugares/sobradinho');
    expect(page).toContain('/bares/sobradinho');
    expect(page).toContain('/parceiros/sobradinho');
  });

  it('entra na navegação regional e no sitemap', () => {
    expect(home).toContain('href="/sobradinho">Sobradinho');
    expect(sitemap).toContain('/sobradinho');
  });
});
