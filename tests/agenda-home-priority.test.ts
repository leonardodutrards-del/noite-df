import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hub = readFileSync(resolve(process.cwd(), 'components/ExperienceHub.tsx'), 'utf8');

describe('Prioridade da agenda na home', () => {
  it('prioriza a agenda semanal antes da mensal', () => {
    expect(hub).toContain("getWeeklyAgenda(events, now)");
    expect(hub).toContain("if (weekly.length > 0) return weekly");
    expect(hub).toContain("getMonthlyAgenda(events, now)");
  });

  it('não usa mais a ordem bruta do arquivo de eventos', () => {
    expect(hub).not.toContain("events.filter((event) => isConfirmedEvent(event))");
    expect(hub).toContain('Eventos mais próximos');
  });
});
