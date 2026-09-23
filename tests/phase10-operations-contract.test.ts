import { describe, expect, it } from 'vitest';
import { calculateEstablishmentCompleteness } from '@/modules/operations/completeness';
import { places } from '@/data/places';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Fase 10 - operação e crescimento', () => {
  it('calcula completude de forma determinística', () => {
    const result = calculateEstablishmentCompleteness(places[0]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.total).toBeGreaterThan(5);
  });

  it('versiona CRM operacional', () => {
    const migration = readFileSync(resolve(process.cwd(), 'database/migrations/008_growth_retention_trials.sql'), 'utf8');
    expect(migration).toContain('partner_pipeline');
    expect(migration).toContain("'trial'");
    expect(migration).toContain('trial_ends_at');
  });
});
